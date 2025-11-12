from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import ProductViewSet
from .views_materials import MaterialViewSet
from .views_pricing import PricingQuoteAPIView
from .views_catalog import CatalogCategoryViewSet, CatalogAttributeViewSet, CatalogOptionViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'materials', MaterialViewSet, basename='material')
router.register(r'catalog/categories', CatalogCategoryViewSet, basename='catalog-category')
router.register(r'catalog/attributes', CatalogAttributeViewSet, basename='catalog-attribute')
router.register(r'catalog/options', CatalogOptionViewSet, basename='catalog-option')

urlpatterns = router.urls + [
    path('pricing/quote', PricingQuoteAPIView.as_view(), name='pricing-quote'),
]
