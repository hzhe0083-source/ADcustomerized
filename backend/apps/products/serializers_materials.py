from rest_framework import serializers
from .models import Material


class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = [
            'id', 'name', 'category', 'specification', 'unit', 'stock_quantity', 'min_stock', 'unit_price', 'supplier', 'is_active',
        ]

