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


class Merchant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField('商户名称', max_length=255)
    slug = models.SlugField('唯一标识', max_length=120, unique=True)
    logo = models.URLField('Logo', blank=True, null=True)
    is_active = models.BooleanField('启用', default=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        db_table = 'merchants'
        verbose_name = '商户'
        verbose_name_plural = '商户'

    def __str__(self):
        return self.name


class MerchantMembership(models.Model):
    ROLE_CHOICES = [
        ('admin', '管理员'),
        ('staff', '员工'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='merchant_memberships')
    merchant = models.ForeignKey(Merchant, on_delete=models.CASCADE, related_name='members')
    role = models.CharField('角色', max_length=20, choices=ROLE_CHOICES, default='admin')
    created_at = models.DateTimeField('创建时间', auto_now_add=True)

    class Meta:
        db_table = 'merchant_memberships'
        verbose_name = '商户成员'
        verbose_name_plural = '商户成员'
        unique_together = ['user', 'merchant']


class MerchantSubscriptionPlan(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField('套餐名称', max_length=100)
    code = models.SlugField('套餐编码', max_length=50, unique=True)
    monthly_price = models.DecimalField('月费', max_digits=10, decimal_places=2)
    yearly_price = models.DecimalField('年费', max_digits=10, decimal_places=2)
    features = models.JSONField('功能清单', default=list)
    is_active = models.BooleanField('启用', default=True)

    class Meta:
        db_table = 'merchant_plans'
        verbose_name = '商户套餐'
        verbose_name_plural = '商户套餐'


class MerchantSubscription(models.Model):
    STATUS_CHOICES = [
        ('active', '有效'),
        ('expired', '已过期'),
        ('cancelled', '已取消'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    merchant = models.ForeignKey(Merchant, on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.ForeignKey(MerchantSubscriptionPlan, on_delete=models.PROTECT)
    status = models.CharField('状态', max_length=20, choices=STATUS_CHOICES, default='active')
    start_date = models.DateField('开始日期')
    end_date = models.DateField('结束日期')
    created_at = models.DateTimeField('创建时间', auto_now_add=True)

    class Meta:
        db_table = 'merchant_subscriptions'
        verbose_name = '商户订阅'
        verbose_name_plural = '商户订阅'

    @property
    def is_active(self):
        from datetime import date
        return self.status == 'active' and self.end_date >= date.today()

class CustomerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='customer_profile')
    merchant = models.ForeignKey('Merchant', on_delete=models.SET_NULL, null=True, blank=True, related_name='customers')
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
