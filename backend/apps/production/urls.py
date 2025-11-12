from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import ProductionPlanViewSet
from .views_nesting import NestingPackAPIView, VectorizePlaceholderAPIView

router = DefaultRouter()
router.register(r'production-plans', ProductionPlanViewSet, basename='production-plan')

urlpatterns = router.urls + [
    path('nesting/pack', NestingPackAPIView.as_view(), name='nesting-pack'),
    path('nesting/vectorize', VectorizePlaceholderAPIView.as_view(), name='nesting-vectorize'),
]
