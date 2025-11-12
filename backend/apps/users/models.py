from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

class User(AbstractUser):
    ROLE_CHOICES = [
        ('customer', '外部客户'),
        ('employee', '内部员工'),
        ('operator', '工厂操作员'),
        ('admin', '系统管理员'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone = models.CharField('手机号', max_length=20, blank=True, null=True)
    role = models.CharField('角色', max_length=20, choices=ROLE_CHOICES, default='customer')
    company = models.CharField('公司名称', max_length=255, blank=True, null=True)
    address = models.TextField('地址', blank=True, null=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)
    
    class Meta:
        db_table = 'users'
        verbose_name = '用户'
        verbose_name_plural = '用户'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
        ]
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

class CustomerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='customer_profile')
    contact_person = models.CharField('联系人', max_length=100)
    contact_phone = models.CharField('联系电话', max_length=20)
    shipping_addresses = models.JSONField('收货地址', default=list)
    credit_limit = models.DecimalField('信用额度', max_digits=10, decimal_places=2, default=0)
    used_credit = models.DecimalField('已用额度', max_digits=10, decimal_places=2, default=0)
    
    class Meta:
        db_table = 'customer_profiles'
        verbose_name = '客户资料'
        verbose_name_plural = '客户资料'
    
    def __str__(self):
        return f"{self.user.username} 的客户资料"

class EmployeeProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employee_profile')
    employee_id = models.CharField('工号', max_length=50, unique=True)
    department = models.CharField('部门', max_length=100)
    position = models.CharField('职位', max_length=100)
    hire_date = models.DateField('入职日期')
    is_active = models.BooleanField('是否在职', default=True)
    
    class Meta:
        db_table = 'employee_profiles'
        verbose_name = '员工资料'
        verbose_name_plural = '员工资料'
    
    def __str__(self):
        return f"{self.user.username} 的员工资料"