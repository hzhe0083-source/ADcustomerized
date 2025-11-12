from rest_framework import serializers
from .models import ProductionPlan


class ProductionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductionPlan
        fields = ['id', 'code', 'name', 'status', 'planned_start', 'planned_end', 'quantity', 'created_at', 'updated_at']

