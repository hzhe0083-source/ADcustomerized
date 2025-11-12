from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import WorkTask, WorkLog, AttendanceRecord
from .serializers_work import WorkTaskSerializer, WorkLogSerializer, WorkLogStartSerializer, WorkLogStopSerializer


class WorkTaskViewSet(viewsets.ModelViewSet):
    serializer_class = WorkTaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WorkTask.objects.filter(user=self.request.user).order_by('-created_at')


class WorkLogViewSet(viewsets.ModelViewSet):
    serializer_class = WorkLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WorkLog.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['post'])
    def start(self, request):
        # 要求今日有签到记录
        today = timezone.localdate()
        if not AttendanceRecord.objects.filter(user=request.user, date=today, check_in_time__isnull=False).exists():
            return Response({'detail': '请先签到后再开始计时'}, status=status.HTTP_400_BAD_REQUEST)
        ser = WorkLogStartSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        task = None
        if ser.validated_data.get('task'):
            try:
                task = WorkTask.objects.get(pk=ser.validated_data['task'], user=request.user)
            except WorkTask.DoesNotExist:
                return Response({'detail': '任务不存在'}, status=404)
        # 结束任何未关闭的日志
        WorkLog.objects.filter(user=request.user, end_time__isnull=True).update(end_time=timezone.now())
        log = WorkLog.objects.create(user=request.user, task=task, start_time=timezone.now(), notes=ser.validated_data.get('notes', ''))
        if task and task.status == 'pending':
            task.status = 'in_progress'
            task.save(update_fields=['status'])
        return Response(WorkLogSerializer(log).data, status=201)

    @action(detail=False, methods=['post'])
    def stop(self, request):
        ser = WorkLogStopSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        log = WorkLog.objects.filter(user=request.user, end_time__isnull=True).order_by('-start_time').first()
        if not log:
            return Response({'detail': '无正在计时的任务'}, status=400)
        log.end_time = timezone.now()
        log.seconds = int((log.end_time - (log.start_time or log.end_time)).total_seconds())
        if ser.validated_data.get('notes'):
            log.notes = ser.validated_data['notes']
        log.save(update_fields=['end_time', 'seconds', 'notes'])
        return Response(WorkLogSerializer(log).data)

