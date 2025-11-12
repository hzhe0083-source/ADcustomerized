from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
import os
from datetime import datetime
from apps.users.models import Merchant, MerchantMembership, CustomerProfile


class UploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'detail': '缺少文件字段 file'}, status=400)

        # 校验大小与类型
        max_size = 25 * 1024 * 1024
        if file_obj.size > max_size:
            return Response({'detail': '文件过大，最大25MB'}, status=400)
        allow_ext = {'.pdf', '.ai', '.psd', '.tif', '.tiff', '.jpg', '.jpeg', '.png', '.zip', '.rar'}
        _, ext = os.path.splitext(file_obj.name.lower())
        if ext not in allow_ext:
            return Response({'detail': '不支持的文件类型'}, status=400)

        # 归属到商户目录
        merchant_slug = request.data.get('merchant')
        merchant = None
        ms = MerchantMembership.objects.filter(user=request.user).first()
        if ms:
            merchant = ms.merchant
        elif merchant_slug:
            merchant = Merchant.objects.filter(slug=merchant_slug).first()

        # 顾客绑定校验
        try:
            cp = CustomerProfile.objects.get(user=request.user)
            if cp.merchant and merchant and cp.merchant != merchant:
                return Response({'detail': '顾客不属于该商户'}, status=403)
            if not cp.merchant and merchant:
                cp.merchant = merchant
                cp.save(update_fields=['merchant'])
        except CustomerProfile.DoesNotExist:
            pass

        date_part = datetime.now().strftime('%Y%m')
        base_dir = os.path.join('uploads', merchant.slug if merchant else 'public', date_part)
        filename = default_storage.save(os.path.join(base_dir, file_obj.name), ContentFile(file_obj.read()))
        url = settings.MEDIA_URL + filename.replace('\\', '/')
        return Response({'url': url, 'name': file_obj.name, 'size': file_obj.size})
