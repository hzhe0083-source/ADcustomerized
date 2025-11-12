from rest_framework import serializers
from .models import AttendanceRecord


class AttendanceRecordSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = ['id', 'username', 'user', 'date', 'check_in_time', 'check_out_time', 'status', 'notes', 'created_at']
        read_only_fields = ['id', 'username', 'created_at']


class CheckInSerializer(serializers.Serializer):
    notes = serializers.CharField(required=False, allow_blank=True)


class CheckOutSerializer(serializers.Serializer):
    notes = serializers.CharField(required=False, allow_blank=True)

