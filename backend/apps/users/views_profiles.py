from rest_framework import viewsets, permissions
from .models import CustomerProfile, EmployeeProfile
from apps.users.models import MerchantMembership
from .serializers_profiles import CustomerProfileSerializer, EmployeeProfileSerializer


class CustomerProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CustomerProfile.objects.select_related('user').all().order_by('-id')
    serializer_class = CustomerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.is_authenticated and not user.is_staff and not user.is_superuser:
            return qs.filter(user=user)
        ms = MerchantMembership.objects.filter(user=user).first()
        if ms:
            qs = qs.filter(merchant=ms.merchant)
        return qs


class EmployeeProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EmployeeProfile.objects.select_related('user').all().order_by('-id')
    serializer_class = EmployeeProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
