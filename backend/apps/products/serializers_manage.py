from rest_framework import serializers
from .models import Product, ProductConfig, ConfigOption


class ProductWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'category', 'description', 'base_price', 'unit', 'is_active', 'images']


class ProductConfigWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductConfig
        fields = ['id', 'product', 'config_type', 'config_name', 'is_required', 'display_order']


class ConfigOptionWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConfigOption
        fields = ['id', 'config', 'name', 'price_adjustment', 'is_default', 'display_order']

