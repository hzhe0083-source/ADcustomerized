from django.db import models
from apps.users.models import Merchant
import uuid


class CatalogCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    merchant = models.ForeignKey(Merchant, on_delete=models.CASCADE, related_name='catalog_categories', null=True, blank=True)
    name = models.CharField('名称', max_length=100)
    slug = models.SlugField('标识', max_length=120, unique=True)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='children')
    sort_order = models.IntegerField('排序', default=0)
    is_active = models.BooleanField('启用', default=True)

    class Meta:
        db_table = 'catalog_categories'
        verbose_name = '目录分类'
        verbose_name_plural = '目录分类'
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name


class CatalogAttribute(models.Model):
    INPUT_TYPE_CHOICES = [
        ('select', '选择'),
        ('number', '数字'),
        ('text', '文本'),
        ('size', '尺寸'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(CatalogCategory, on_delete=models.CASCADE, related_name='attributes')
    name = models.CharField('属性名', max_length=100)
    key = models.CharField('键', max_length=100)
    input_type = models.CharField('类型', max_length=20, choices=INPUT_TYPE_CHOICES, default='select')
    required = models.BooleanField('必填', default=False)
    sort_order = models.IntegerField('排序', default=0)

    class Meta:
        db_table = 'catalog_attributes'
        verbose_name = '目录属性'
        verbose_name_plural = '目录属性'
        ordering = ['sort_order', 'name']

    def __str__(self):
        return f"{self.category.name}-{self.name}"


class CatalogOption(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    attribute = models.ForeignKey(CatalogAttribute, on_delete=models.CASCADE, related_name='options')
    name = models.CharField('选项名', max_length=100)
    price_adjustment = models.DecimalField('加价', max_digits=10, decimal_places=2, default=0)
    sort_order = models.IntegerField('排序', default=0)

    class Meta:
        db_table = 'catalog_options'
        verbose_name = '目录选项'
        verbose_name_plural = '目录选项'
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name
