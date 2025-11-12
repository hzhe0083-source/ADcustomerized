from rest_framework.routers import DefaultRouter
from .views import ProductionPlanViewSet

router = DefaultRouter()
router.register(r'production-plans', ProductionPlanViewSet, basename='production-plan')

urlpatterns = router.urls

