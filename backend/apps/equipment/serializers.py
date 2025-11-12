from rest_framework import serializers
from .models import Equipment


class EquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipment
        fields = ['id', 'name', 'model', 'status', 'location', 'last_maintenance', 'created_at', 'updated_at']

