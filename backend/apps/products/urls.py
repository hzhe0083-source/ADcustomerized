from rest_framework.routers import DefaultRouter
from .views import ProductViewSet
from .views_materials import MaterialViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'materials', MaterialViewSet, basename='material')

urlpatterns = router.urls
