from django.db import models
import uuid


class ProductionPlan(models.Model):
    STATUS_CHOICES = [
        ('draft', '草稿'),
        ('scheduled', '已安排'),
        ('in_progress', '进行中'),
        ('completed', '已完成'),
        ('cancelled', '已取消'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField('计划编号', max_length=50, unique=True)
    name = models.CharField('计划名称', max_length=255)
    status = models.CharField('状态', max_length=20, choices=STATUS_CHOICES, default='draft')
    planned_start = models.DateField('计划开始', null=True, blank=True)
    planned_end = models.DateField('计划结束', null=True, blank=True)
    quantity = models.DecimalField('计划数量', max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        db_table = 'production_plans'
        verbose_name = '生产计划'
        verbose_name_plural = '生产计划'

    def __str__(self):
        return self.code

