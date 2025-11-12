from django.db import models
import uuid


class Equipment(models.Model):
    STATUS_CHOICES = [
        ('idle', '空闲'),
        ('running', '运行中'),
        ('maintenance', '维护'),
        ('error', '故障'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField('设备名称', max_length=255)
    model = models.CharField('型号', max_length=100, blank=True)
    status = models.CharField('状态', max_length=20, choices=STATUS_CHOICES, default='idle')
    location = models.CharField('位置', max_length=255, blank=True)
    last_maintenance = models.DateField('上次维护日期', null=True, blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        db_table = 'equipment'
        verbose_name = '设备'
        verbose_name_plural = '设备'

    def __str__(self):
        return self.name

