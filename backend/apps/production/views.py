from rest_framework import viewsets, permissions
from .models import ProductionPlan
from .serializers import ProductionPlanSerializer


class ProductionPlanViewSet(viewsets.ModelViewSet):
    queryset = ProductionPlan.objects.all().order_by('-created_at')
    serializer_class = ProductionPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

