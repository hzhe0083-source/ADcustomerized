from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter
from apps.users.views_profiles import CustomerProfileViewSet, EmployeeProfileViewSet
from apps.equipment.urls import router as equipment_router
from apps.production.urls import router as production_router

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='docs'),
    path('api/auth/', include('apps.users.urls')),
    path('api/', include('apps.products.urls')),
    path('api/', include('apps.orders.urls')),
    path('api/', include('apps.equipment.urls')),
    path('api/', include('apps.production.urls')),
    path('api/', include('apps.analytics.urls')),
]

router = DefaultRouter()
router.register(r'customers', CustomerProfileViewSet, basename='customers')
router.register(r'employees', EmployeeProfileViewSet, basename='employees')

urlpatterns += [
    path('api/', include(router.urls)),
]

# 开发环境下提供媒体文件访问
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
