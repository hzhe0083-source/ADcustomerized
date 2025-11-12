from rest_framework import viewsets, permissions
from .models import Equipment
from .serializers import EquipmentSerializer


class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all().order_by('name')
    serializer_class = EquipmentSerializer
    permission_classes = [permissions.IsAuthenticated]

