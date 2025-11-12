from django.db import models
import uuid

class Product(models.Model):
    CATEGORY_CHOICES = [
        ('uv_roll', 'UV卷材'),
        ('banner', '喷绘布'),
        ('car_sticker', '车贴'),
        ('lightbox', '灯箱片'),
        ('kt_board', 'KT板'),
        ('pvc_board', 'PVC板'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField('产品名称', max_length=255)
    category = models.CharField('产品分类', max_length=50, choices=CATEGORY_CHOICES)
    description = models.TextField('产品描述', blank=True)
    base_price = models.DecimalField('基础价格', max_digits=10, decimal_places=2)
    unit = models.CharField('单位', max_length=20, default='平方米')
    is_active = models.BooleanField('是否启用', default=True)
    images = models.JSONField('产品图片', default=list)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)
    
    class Meta:
        db_table = 'products'
        verbose_name = '产品'
        verbose_name_plural = '产品'
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"

class ProductConfig(models.Model):
    CONFIG_TYPE_CHOICES = [
        ('size', '尺寸'),
        ('material', '材料'),
        ('process', '工艺'),
        ('color', '颜色'),
        ('finish', '后处理'),
    ]
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='configs')
    config_type = models.CharField('配置类型', max_length=50, choices=CONFIG_TYPE_CHOICES)
    config_name = models.CharField('配置名称', max_length=100)
    is_required = models.BooleanField('是否必填', default=True)
    display_order = models.IntegerField('显示顺序', default=0)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    
    class Meta:
        db_table = 'product_configs'
        verbose_name = '产品配置'
        verbose_name_plural = '产品配置'
        ordering = ['display_order']
    
    def __str__(self):
        return f"{self.product.name} - {self.config_name}"

class ConfigOption(models.Model):
    config = models.ForeignKey(ProductConfig, on_delete=models.CASCADE, related_name='options')
    name = models.CharField('选项名称', max_length=100)
    price_adjustment = models.DecimalField('价格调整', max_digits=10, decimal_places=2, default=0)
    is_default = models.BooleanField('是否默认', default=False)
    display_order = models.IntegerField('显示顺序', default=0)
    
    class Meta:
        db_table = 'config_options'
        verbose_name = '配置选项'
        verbose_name_plural = '配置选项'
        ordering = ['display_order']
    
    def __str__(self):
        return f"{self.config.config_name} - {self.name}"

class Material(models.Model):
    CATEGORY_CHOICES = [
        ('ink', '墨水'),
        ('substrate', '基材'),
        ('coating', '涂层'),
        ('accessory', '辅料'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField('物料名称', max_length=255)
    category = models.CharField('物料分类', max_length=50, choices=CATEGORY_CHOICES)
    specification = models.CharField('规格型号', max_length=255, blank=True)
    unit = models.CharField('单位', max_length=20)
    stock_quantity = models.DecimalField('库存数量', max_digits=10, decimal_places=2, default=0)
    min_stock = models.DecimalField('最低库存', max_digits=10, decimal_places=2, default=0)
    unit_price = models.DecimalField('单价', max_digits=10, decimal_places=2, default=0)
    supplier = models.CharField('供应商', max_length=255, blank=True)
    is_active = models.BooleanField('是否启用', default=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)
    
    class Meta:
        db_table = 'materials'
        verbose_name = '物料'
        verbose_name_plural = '物料'
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.specification})"

class BOM(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='boms')
    material = models.ForeignKey(Material, on_delete=models.CASCADE, related_name='boms')
    quantity = models.DecimalField('用量', max_digits=10, decimal_places=4)
    waste_rate = models.DecimalField('损耗率', max_digits=5, decimal_places=2, default=0)
    is_active = models.BooleanField('是否启用', default=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    
    class Meta:
        db_table = 'bom'
        verbose_name = '物料清单'
        verbose_name_plural = '物料清单'
        unique_together = ['product', 'material']
    
    def __str__(self):
        return f"{self.product.name} - {self.material.name}"