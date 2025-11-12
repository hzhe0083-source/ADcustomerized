from rest_framework import serializers
from .models import WorkTask, WorkLog


class WorkTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkTask
        fields = ['id', 'title', 'status', 'created_at', 'updated_at']

    def create(self, validated_data):
        user = self.context['request'].user
        return WorkTask.objects.create(user=user, **validated_data)


class WorkLogSerializer(serializers.ModelSerializer):
    taskTitle = serializers.CharField(source='task.title', read_only=True)

    class Meta:
        model = WorkLog
        fields = ['id', 'task', 'taskTitle', 'date', 'start_time', 'end_time', 'seconds', 'notes', 'created_at']


class WorkLogStartSerializer(serializers.Serializer):
    task = serializers.UUIDField(required=False)
    notes = serializers.CharField(required=False, allow_blank=True)


class WorkLogStopSerializer(serializers.Serializer):
    notes = serializers.CharField(required=False, allow_blank=True)

