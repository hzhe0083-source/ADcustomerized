from rest_framework import viewsets, permissions
from .models_catalog import CatalogCategory, CatalogAttribute, CatalogOption
from .serializers_catalog import CatalogCategorySerializer, CatalogAttributeSerializer, CatalogOptionSerializer
from apps.users.models import Merchant, MerchantMembership


class CatalogCategoryViewSet(viewsets.ModelViewSet):
    queryset = CatalogCategory.objects.all()
    serializer_class = CatalogCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return super().get_permissions()
    def get_queryset(self):
        qs = super().get_queryset()
        slug = self.request.query_params.get('merchant')
        if slug:
            try:
                m = Merchant.objects.get(slug=slug)
                qs = qs.filter(merchant=m, is_active=True)
            except Merchant.DoesNotExist:
                qs = qs.none()
        else:
            ms = MerchantMembership.objects.filter(user=self.request.user).first()
            if ms:
                qs = qs.filter(merchant=ms.merchant)
        return qs
    def perform_create(self, serializer):
        ms = MerchantMembership.objects.filter(user=self.request.user).first()
        if not ms:
            raise PermissionError('未绑定商户')
        # 订阅有效性（写操作需有效）
        from apps.users.models import MerchantSubscription
        sub = MerchantSubscription.objects.filter(merchant=ms.merchant).order_by('-end_date').first()
        if not sub or not sub.is_active:
            raise PermissionError('商户订阅已到期或未开通')
        serializer.save(merchant=ms.merchant)


class CatalogAttributeViewSet(viewsets.ModelViewSet):
    queryset = CatalogAttribute.objects.all()
    serializer_class = CatalogAttributeSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return super().get_permissions()
    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category_id=category)
        return qs


class CatalogOptionViewSet(viewsets.ModelViewSet):
    queryset = CatalogOption.objects.all()
    serializer_class = CatalogOptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return super().get_permissions()
