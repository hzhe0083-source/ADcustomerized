from dataclasses import dataclass
from typing import List, Dict, Tuple
from io import BytesIO
from PIL import Image, ImageFile
import base64
ImageFile.LOAD_TRUNCATED_IMAGES = True

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser


@dataclass
class Rect:
    w: float
    h: float
    id: str
    rotate: bool


class ShelfPacker:
    def __init__(self, sheet_w: float, sheet_h: float):
        self.SW = sheet_w
        self.SH = sheet_h

    def pack(self, rects: List[Rect], gap: float = 0.0, margin: float = 0.0):
        # sort by height descending (consider rotation)
        items = []
        for r in rects:
            w, h = (r.w, r.h)
            if r.rotate and h > w and h <= self.SW and w <= self.SH:
                # prefer rotate tall items to fit shelves better when needed
                w, h = h, w
            items.append((r.id, w, h, r.rotate))
        items.sort(key=lambda x: max(x[1], x[2]), reverse=True)

        sheets: List[Dict] = []
        placements: List[Dict] = []
        current_sheet = 0
        x = margin
        y = margin
        shelf_h = 0.0
        used_area = 0.0

        def new_sheet():
            nonlocal current_sheet, x, y, shelf_h
            current_sheet += 1
            x = margin
            y = margin
            shelf_h = 0.0

        new_sheet()
        total_area = 0.0
        for rid, w, h, rot in items:
            total_area += w * h
            # place on current shelf or new shelf/sheet
            if w > self.SW:  # cannot fit ever
                placements.append({'id': rid, 'sheet': None, 'x': None, 'y': None, 'w': w, 'h': h, 'rotated': False, 'placed': False})
                continue
            if x + w + margin > self.SW:
                # new shelf
                x = margin
                y += shelf_h + gap
                shelf_h = 0.0
            if y + h + margin > self.SH:
                # new sheet
                sheets.append({'index': current_sheet, 'w': self.SW, 'h': self.SH})
                new_sheet()
            # place
            placements.append({'id': rid, 'sheet': current_sheet, 'x': x, 'y': y, 'w': w, 'h': h, 'rotated': False, 'placed': True})
            used_area += w * h
            x += w + gap
            shelf_h = max(shelf_h, h)
        # append last sheet meta
        sheets.append({'index': current_sheet, 'w': self.SW, 'h': self.SH})
        util = used_area / (len(sheets) * self.SW * self.SH) if sheets else 0.0
        return {'sheets': sheets, 'placements': placements, 'utilization': round(util, 4), 'totalArea': total_area}


class NestingPackAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser]

    def post(self, request):
        gap = float(request.data.get('gap') or 0.0)
        margin = float(request.data.get('margin') or 0.0)
        by_cat = bool(request.data.get('byCategory', False))

        def pack_one(sheet_obj, items):
            SW = float(sheet_obj.get('width') or 1000)
            SH = float(sheet_obj.get('height') or 1000)
            rects: List[Rect] = []
            for it in items:
                qty = int(it.get('qty') or 1)
                for i in range(qty):
                    rects.append(Rect(
                        w=float(it.get('w') or it.get('width') or 0),
                        h=float(it.get('h') or it.get('height') or 0),
                        id=f"{it.get('id') or 'item'}-{i}",
                        rotate=bool(it.get('rotate', True)),
                    ))
            packer = ShelfPacker(SW, SH)
            return packer.pack(rects, gap=gap, margin=margin)

        if by_cat:
            # items 按 category 分组；sheetByCategory 为 {category: {width,height}}
            items = request.data.get('items') or []
            sheet_map = request.data.get('sheetByCategory') or {}
            out = {}
            cats = {}
            for it in items:
                cats.setdefault(it.get('category') or 'default', []).append(it)
            for cat, arr in cats.items():
                sheet_obj = sheet_map.get(cat) or request.data.get('sheet') or {'width': 1000, 'height': 1000}
                out[cat] = pack_one(sheet_obj, arr)
            return Response(out)
        else:
            sheet = request.data.get('sheet') or {'width': 1000, 'height': 1000}
            items = request.data.get('items') or []
            return Response(pack_one(sheet, items))


def _convex_hull(points: List[Tuple[int, int]]):
    # Monotone chain convex hull
    pts = sorted(points)
    if len(pts) <= 1:
        return pts
    def cross(o,a,b):
        return (a[0]-o[0])*(b[1]-o[1]) - (a[1]-o[1])*(b[0]-o[0])
    lower = []
    for p in pts:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)
    upper = []
    for p in reversed(pts):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)
    hull = lower[:-1] + upper[:-1]
    return hull


class VectorizePlaceholderAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        # 简易矢量化：取非透明/非白背景像素采样点，计算凸包输出 SVG 多边形
        files = request.FILES.getlist('files') or ([request.FILES.get('file')] if request.FILES.get('file') else [])
        if not files:
            return Response({'detail': '缺少文件'}, status=400)
        threshold = int(request.data.get('threshold') or 240)
        max_side = int(request.data.get('max_side') or 600)
        results = []
        for f in files:
            logs = []
            try:
                raw = f.read()
                if len(raw) == 0:
                    results.append({'name': f.name, 'error': '文件为空'})
                    continue
                # 基本格式校验
                ext = (f.name.split('.')[-1] or '').lower()
                if ext not in {'png','jpg','jpeg','tif','tiff'}:
                    results.append({'name': f.name, 'error': '不支持的格式', 'ext': ext})
                    continue
                img = Image.open(BytesIO(raw)).convert('RGBA')
                logs.append({'step':'open','mode': img.mode})
            except Exception:
                results.append({'name': f.name, 'error': '无法读取图像'})
                continue
            w0, h0 = img.size
            if w0 <= 1 or h0 <= 1 or w0 > 8000 or h0 > 8000:
                results.append({'name': f.name, 'error': '尺寸异常', 'width': w0, 'height': h0})
                continue
            # 缩放到 max_side 以内以加速
            scale = 1.0
            if max(w0, h0) > max_side:
                scale = max_side / max(w0, h0)
                img = img.resize((int(w0*scale), int(h0*scale)))
            w, h = img.size
            px = img.load()
            pts: List[Tuple[int,int]] = []
            step = max(1, int(max(1, max(w,h)) // 300))  # 更细采样
            # 同时使用透明度、亮度与边缘梯度三种判定
            def lum(r,g,b):
                return (0.299*r + 0.587*g + 0.114*b)
            for y in range(0, h, step):
                for x in range(0, w, step):
                    r,g,b,a = px[x,y]
                    if a <= 10:
                        continue
                    L = lum(r,g,b)
                    edge = 0
                    if x+1 < w:
                        r2,g2,b2,a2 = px[x+1,y]
                        edge = max(edge, abs(int(lum(r2,g2,b2) - L)))
                    if y+1 < h:
                        r3,g3,b3,a3 = px[x,y+1]
                        edge = max(edge, abs(int(lum(r3,g3,b3) - L)))
                    if L < threshold or edge > 12:
                        pts.append((x,y))
            if not pts:
                # 兜底使用整图
                pts = [(0,0),(w,0),(w,h),(0,h)]
            hull = _convex_hull(pts)
            # 还原到原图尺寸
            inv = 1.0/scale
            hull_orig = [(round(x*inv,2), round(y*inv,2)) for x,y in hull]
            # 宽高兜底，避免 0 尺寸
            minX = min(x for x,_ in hull_orig); minY = min(y for _,y in hull_orig)
            maxX = max(x for x,_ in hull_orig); maxY = max(y for _,y in hull_orig)
            if maxX - minX < 1 or maxY - minY < 1:
                minX, minY, maxX, maxY = 0, 0, w0, h0
            points_attr = ' '.join([f"{x},{y}" for x,y in hull_orig])
            svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{w0}" height="{h0}"><polygon points="{points_attr}" fill="none" stroke="black"/></svg>'
            bbox = {
                'minX': minX,
                'minY': minY,
                'maxX': maxX,
                'maxY': maxY,
            }
            # 生成独立 SVG（嵌入原图 dataURL，无损PNG）
            buf = BytesIO()
            img_full = Image.open(BytesIO(raw)).convert('RGBA')
            img_full.save(buf, format='PNG', optimize=True)
            data_url = 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode('ascii')
            svg_standalone = f'<svg xmlns="http://www.w3.org/2000/svg" width="{w0}" height="{h0}"><image href="{data_url}" width="{w0}" height="{h0}" preserveAspectRatio="xMidYMid meet"/></svg>'
            results.append({
                'name': f.name,
                'format': 'png' if ext=='png' else ext,
                'svg': svg,
                'svgStandalone': svg_standalone,
                'dataUrl': data_url,
                'width': w0,
                'height': h0,
                'hull': hull_orig,
                'bbox': bbox,
                'log': logs,
            })
        return Response({'results': results})
