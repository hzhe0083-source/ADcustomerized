from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import RegisterAPIView, LoginAPIView, MeAPIView
from .views_merchants import MerchantMeView, MerchantPlanViewSet, MerchantSubscribeView, MerchantBootstrapView, MerchantPublicView
from .views_attendance import AttendanceViewSet
from .views_work import WorkTaskViewSet, WorkLogViewSet

urlpatterns = [
    path('register', RegisterAPIView.as_view(), name='auth-register'),
    path('login', LoginAPIView.as_view(), name='auth-login'),
    path('me', MeAPIView.as_view(), name='auth-me'),
    path('merchant/me', MerchantMeView.as_view(), name='merchant-me'),
    path('merchant/subscribe', MerchantSubscribeView.as_view(), name='merchant-subscribe'),
    path('merchant/bootstrap', MerchantBootstrapView.as_view(), name='merchant-bootstrap'),
    path('merchant/public/<slug:slug>', MerchantPublicView.as_view(), name='merchant-public'),
]

router = DefaultRouter()
router.register(r'merchant/plans', MerchantPlanViewSet, basename='merchant-plan')
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'tasks', WorkTaskViewSet, basename='work-task')
router.register(r'worklogs', WorkLogViewSet, basename='work-log')

urlpatterns += router.urls
