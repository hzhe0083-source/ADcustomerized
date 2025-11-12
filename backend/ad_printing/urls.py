from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter
from apps.users.views_profiles import CustomerProfileViewSet, EmployeeProfileViewSet
from apps.products.urls import router as products_router
from apps.orders.urls import router as orders_router

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='docs'),
    path('api/auth/', include('apps.users.urls')),
    path('api/', include('apps.products.urls')),
    path('api/', include('apps.orders.urls')),
]

router = DefaultRouter()
router.register(r'customers', CustomerProfileViewSet, basename='customers')
router.register(r'employees', EmployeeProfileViewSet, basename='employees')

urlpatterns += [
    path('api/', include(router.urls)),
]
