from rest_framework import serializers
from .models_catalog import CatalogCategory, CatalogAttribute, CatalogOption


class CatalogOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CatalogOption
        fields = ['id', 'name', 'price_adjustment', 'sort_order']


class CatalogAttributeSerializer(serializers.ModelSerializer):
    options = CatalogOptionSerializer(many=True, read_only=True)

    class Meta:
        model = CatalogAttribute
        fields = ['id', 'category', 'name', 'key', 'input_type', 'required', 'sort_order', 'options']


class CatalogCategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = CatalogCategory
        fields = ['id', 'name', 'slug', 'parent', 'sort_order', 'is_active', 'children']

    def get_children(self, obj):
        return CatalogCategorySerializer(obj.children.filter(is_active=True).order_by('sort_order'), many=True).data

