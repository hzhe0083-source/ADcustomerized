from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from decimal import Decimal

from .models import Product, ConfigOption
from apps.users.models import Merchant, MerchantSubscription
from .serializers_pricing import QuoteRequestSerializer


def _to_m2(width: float, height: float, unit: str) -> float:
    if unit == 'mm':
        w = Decimal(width) / Decimal(1000)
        h = Decimal(height) / Decimal(1000)
    elif unit == 'cm':
        w = Decimal(width) / Decimal(100)
        h = Decimal(height) / Decimal(100)
    else:
        w = Decimal(width)
        h = Decimal(height)
    area = w * h
    # 最小计价面积可在此处理（如 0.1 平米）
    return float(area)


class PricingQuoteAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        ser = QuoteRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        product = Product.objects.get(pk=data['productId'])
        slug = data.get('merchant')
        if slug:
            try:
                m = Merchant.objects.get(slug=slug)
            except Merchant.DoesNotExist:
                return Response({'detail': '商户不存在'}, status=400)
            if product.merchant_id != m.id:
                return Response({'detail': '商品不属于该商户'}, status=400)
            sub = MerchantSubscription.objects.filter(merchant=m).order_by('-end_date').first()
            if not sub or not sub.is_active:
                return Response({'detail': '商户订阅已到期或未开通'}, status=403)
        area = _to_m2(data['width'], data['height'], data['unit'])
        qty = Decimal(str(data.get('quantity', 1)))

        base = Decimal(product.base_price)
        adjustments = []
        total_adjust = Decimal('0')
        for it in data.get('options', []) or []:
            try:
                opt = ConfigOption.objects.get(pk=it['optionId'])
                delta = Decimal(opt.price_adjustment)
                total_adjust += delta
                adjustments.append({'name': opt.name, 'delta': float(delta)})
            except ConfigOption.DoesNotExist:
                continue

        price_per_m2 = base + total_adjust
        unit_price = price_per_m2 * Decimal(str(area))
        subtotal = unit_price * qty

        result = {
            'unitPrice': float(unit_price.quantize(Decimal('0.01'))),
            'area': float(Decimal(str(area)).quantize(Decimal('0.0001'))),
            'quantity': float(qty),
            'subtotal': float(subtotal.quantize(Decimal('0.01'))),
            'breakdown': {
                'basePricePerM2': float(base),
                'adjustments': adjustments,
                'pricePerM2': float(price_per_m2),
                'formula': 'unit_price = (base + sum(adj)) * area; subtotal = unit_price * quantity',
            },
        }
        return Response(result)
