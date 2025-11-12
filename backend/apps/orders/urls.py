from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import OrderViewSet
from .views_uploads import UploadView
from .views_cart import CartViewSet, CartItemViewSet

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'cart/items', CartItemViewSet, basename='cart-item')

urlpatterns = router.urls + [
    path('uploads', UploadView.as_view(), name='upload'),
]
