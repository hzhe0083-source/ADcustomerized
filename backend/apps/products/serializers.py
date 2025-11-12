from rest_framework import serializers
from .models import Product, ProductConfig, ConfigOption


class ConfigOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConfigOption
        fields = ['id', 'name', 'price_adjustment', 'is_default', 'display_order']


class ProductConfigSerializer(serializers.ModelSerializer):
    options = ConfigOptionSerializer(many=True, read_only=True)

    class Meta:
        model = ProductConfig
        fields = ['id', 'config_type', 'config_name', 'is_required', 'display_order', 'options']


class ProductSerializer(serializers.ModelSerializer):
    configs = ProductConfigSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'category', 'description', 'base_price', 'unit', 'is_active', 'images',
            'created_at', 'updated_at', 'configs'
        ]

