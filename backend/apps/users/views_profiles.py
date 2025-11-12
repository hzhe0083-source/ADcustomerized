from rest_framework import viewsets, permissions
from .models import CustomerProfile, EmployeeProfile
from .serializers_profiles import CustomerProfileSerializer, EmployeeProfileSerializer


class CustomerProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CustomerProfile.objects.select_related('user').all().order_by('-id')
    serializer_class = CustomerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]


class EmployeeProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EmployeeProfile.objects.select_related('user').all().order_by('-id')
    serializer_class = EmployeeProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

