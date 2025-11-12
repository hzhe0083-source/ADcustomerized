from rest_framework import viewsets, permissions
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q

from .models import Product
from .serializers import ProductSerializer
from apps.users.models import Merchant, MerchantMembership, MerchantSubscription


class DefaultPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'pageSize'
    page_query_param = 'page'


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = DefaultPagination

    def get_queryset(self):
        qs = super().get_queryset()
        # 商户过滤
        slug = self.request.query_params.get('merchant')
        if slug:
            try:
                m = Merchant.objects.get(slug=slug)
                qs = qs.filter(merchant=m)
                # 订阅校验（顾客端访问也校验）
                sub = MerchantSubscription.objects.filter(merchant=m).order_by('-end_date').first()
                if not sub or not sub.is_active:
                    return qs.none()
            except Merchant.DoesNotExist:
                return qs.none()
        else:
            ms = MerchantMembership.objects.filter(user=self.request.user).first() if self.request.user and self.request.user.is_authenticated else None
            if ms:
                qs = qs.filter(merchant=ms.merchant)
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')
        if category:
            qs = qs.filter(category=category)
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(description__icontains=search))
        return qs
