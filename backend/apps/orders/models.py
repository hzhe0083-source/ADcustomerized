from django.db import models
from django.conf import settings
import uuid
from apps.users.models import Merchant

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', '待付款'),
        ('confirmed', '已确认'),
        ('processing', '生产中'),
        ('completed', '已完成'),
        ('shipped', '已发货'),
        ('delivered', '已交付'),
        ('cancelled', '已取消'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    merchant = models.ForeignKey(Merchant, on_delete=models.CASCADE, related_name='orders', null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    order_number = models.CharField('订单号', max_length=50, unique=True)
    status = models.CharField('订单状态', max_length=20, choices=STATUS_CHOICES, default='pending')
    total_amount = models.DecimalField('总金额', max_digits=10, decimal_places=2)
    shipping_address = models.JSONField('收货地址')
    notes = models.TextField('备注信息', blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)
    
    class Meta:
        db_table = 'orders'
        verbose_name = '订单'
        verbose_name_plural = '订单'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.order_number} - {self.user.username}"
    
    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = self.generate_order_number()
        super().save(*args, **kwargs)
    
    def generate_order_number(self):
        from datetime import datetime
        date_str = datetime.now().strftime('%Y%m%d')
        count = Order.objects.filter(created_at__date=datetime.now().date()).count() + 1
        return f"AD{date_str}{count:04d}"

class OrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE)
    quantity = models.DecimalField('数量', max_digits=10, decimal_places=2)
    unit_price = models.DecimalField('单价', max_digits=10, decimal_places=2)
    config_data = models.JSONField('配置数据', default=dict)
    subtotal = models.DecimalField('小计', max_digits=10, decimal_places=2)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    
    class Meta:
        db_table = 'order_items'
        verbose_name = '订单项'
        verbose_name_plural = '订单项'
    
    def __str__(self):
        return f"{self.order.order_number} - {self.product.name}"

class OrderStatusHistory(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_history')
    status = models.CharField('状态', max_length=20, choices=Order.STATUS_CHOICES)
    notes = models.TextField('备注', blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    
    class Meta:
        db_table = 'order_status_history'
        verbose_name = '订单状态历史'
        verbose_name_plural = '订单状态历史'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.order.order_number} - {self.get_status_display()}"

class Cart(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cart')
    merchant = models.ForeignKey('users.Merchant', on_delete=models.SET_NULL, null=True, blank=True, related_name='carts')
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)
    
    class Meta:
        db_table = 'carts'
        verbose_name = '购物车'
        verbose_name_plural = '购物车'
    
    def __str__(self):
        return f"{self.user.username} 的购物车"

class CartItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE)
    quantity = models.DecimalField('数量', max_digits=10, decimal_places=2)
    config_data = models.JSONField('配置数据', default=dict)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)
    
    class Meta:
        db_table = 'cart_items'
        verbose_name = '购物车项'
        verbose_name_plural = '购物车项'
    
    def __str__(self):
        return f"{self.cart.user.username} - {self.product.name}"
