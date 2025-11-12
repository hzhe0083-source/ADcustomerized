from rest_framework import viewsets, permissions
from .models import Material
from .serializers_materials import MaterialSerializer


class MaterialViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Material.objects.filter(is_active=True).order_by('name')
    serializer_class = MaterialSerializer
    permission_classes = [permissions.IsAuthenticated]

