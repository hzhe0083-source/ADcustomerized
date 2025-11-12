from rest_framework import viewsets, permissions
from .models import Product, ProductConfig, ConfigOption
from .serializers import ProductSerializer
from .serializers_manage import ProductWriteSerializer, ProductConfigWriteSerializer, ConfigOptionWriteSerializer
from apps.users.models import MerchantMembership, MerchantSubscription


class MerchantProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('-created_at')
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return ProductSerializer
        return ProductWriteSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        ms = MerchantMembership.objects.filter(user=self.request.user).first()
        if ms:
            qs = qs.filter(merchant=ms.merchant)
        else:
            qs = qs.none()
        return qs

    def perform_create(self, serializer):
        ms = MerchantMembership.objects.filter(user=self.request.user).first()
        if not ms:
            raise PermissionError('未绑定商户')
        sub = MerchantSubscription.objects.filter(merchant=ms.merchant).order_by('-end_date').first()
        if not sub or not sub.is_active:
            raise PermissionError('商户订阅已到期或未开通')
        serializer.save(merchant=ms.merchant)


class MerchantProductConfigViewSet(viewsets.ModelViewSet):
    queryset = ProductConfig.objects.all().order_by('display_order')
    serializer_class = ProductConfigWriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        product_id = self.request.query_params.get('product')
        if product_id:
            qs = qs.filter(product_id=product_id)
        ms = MerchantMembership.objects.filter(user=self.request.user).first()
        if ms:
            qs = qs.filter(product__merchant=ms.merchant)
        else:
            qs = qs.none()
        return qs

    def perform_create(self, serializer):
        ms = MerchantMembership.objects.filter(user=self.request.user).first()
        if not ms:
            raise PermissionError('未绑定商户')
        sub = MerchantSubscription.objects.filter(merchant=ms.merchant).order_by('-end_date').first()
        if not sub or not sub.is_active:
            raise PermissionError('商户订阅已到期或未开通')
        serializer.save()


class MerchantConfigOptionViewSet(viewsets.ModelViewSet):
    queryset = ConfigOption.objects.all().order_by('display_order')
    serializer_class = ConfigOptionWriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        config_id = self.request.query_params.get('config')
        if config_id:
            qs = qs.filter(config_id=config_id)
        ms = MerchantMembership.objects.filter(user=self.request.user).first()
        if ms:
            qs = qs.filter(config__product__merchant=ms.merchant)
        else:
            qs = qs.none()
        return qs

    def perform_create(self, serializer):
        ms = MerchantMembership.objects.filter(user=self.request.user).first()
        if not ms:
            raise PermissionError('未绑定商户')
        sub = MerchantSubscription.objects.filter(merchant=ms.merchant).order_by('-end_date').first()
        if not sub or not sub.is_active:
            raise PermissionError('商户订阅已到期或未开通')
        serializer.save()

