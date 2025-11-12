from datetime import date
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import AttendanceRecord
from .serializers_attendance import AttendanceRecordSerializer, CheckInSerializer, CheckOutSerializer


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = AttendanceRecord.objects.select_related('user').all().order_by('-date', '-created_at')
    serializer_class = AttendanceRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        u = self.request.user
        # 普通用户仅看自己的；管理员可看全部（或后续按部门）
        if not u.is_staff and not u.is_superuser:
            qs = qs.filter(user=u)
        start = self.request.query_params.get('start')
        end = self.request.query_params.get('end')
        if start:
            qs = qs.filter(date__gte=start)
        if end:
            qs = qs.filter(date__lte=end)
        return qs

    @action(detail=False, methods=['post'])
    def checkin(self, request):
        ser = CheckInSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        today = date.today()
        rec, created = AttendanceRecord.objects.get_or_create(user=request.user, date=today, defaults={
            'check_in_time': timezone.now(),
            'status': 'present',
            'notes': ser.validated_data.get('notes', ''),
        })
        if not created and not rec.check_in_time:
            rec.check_in_time = timezone.now()
            rec.notes = ser.validated_data.get('notes', rec.notes)
            rec.save(update_fields=['check_in_time', 'notes'])
        return Response(AttendanceRecordSerializer(rec).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def checkout(self, request):
        ser = CheckOutSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        today = date.today()
        rec, _ = AttendanceRecord.objects.get_or_create(user=request.user, date=today)
        if not rec.check_out_time:
            rec.check_out_time = timezone.now()
            if ser.validated_data.get('notes'):
                rec.notes = ser.validated_data['notes']
            rec.save(update_fields=['check_out_time', 'notes'])
        return Response(AttendanceRecordSerializer(rec).data)

