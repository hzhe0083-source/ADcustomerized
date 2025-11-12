from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import OrderViewSet
from .views_uploads import UploadView

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = router.urls + [
    path('uploads', UploadView.as_view(), name='upload'),
]
