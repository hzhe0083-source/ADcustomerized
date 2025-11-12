from rest_framework import serializers
from django.conf import settings
from .models import Order, OrderItem, OrderStatusHistory
from apps.products.models import Product
from apps.users.models import Merchant, MerchantMembership, MerchantSubscription, CustomerProfile
from decimal import Decimal
from apps.products.models import ConfigOption


class OrderItemSerializer(serializers.ModelSerializer):
    productId = serializers.UUIDField(source='product.id', read_only=True)
    productName = serializers.CharField(source='product.name', read_only=True)
    price = serializers.FloatField(source='unit_price')
    configs = serializers.JSONField(source='config_data')

    class Meta:
        model = OrderItem
        fields = ['id', 'productId', 'productName', 'quantity', 'price', 'configs', 'subtotal']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    orderNumber = serializers.CharField(source='order_number')
    totalAmount = serializers.FloatField(source='total_amount')
    createdAt = serializers.DateTimeField(source='created_at')
    updatedAt = serializers.DateTimeField(source='updated_at')
    customerName = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()
    deliveryMethod = serializers.SerializerMethodField()
    deliveryDate = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'orderNumber', 'status', 'totalAmount', 'notes', 'createdAt', 'updatedAt',
            'customerName', 'phone', 'email', 'address', 'deliveryMethod', 'deliveryDate',
            'items'
        ]

    def _sa(self, obj, key, default=None):
        try:
            return (obj.shipping_address or {}).get(key, default)
        except Exception:
            return default

    def get_customerName(self, obj):
        return self._sa(obj, 'customerName', '')

    def get_phone(self, obj):
        return self._sa(obj, 'phone', '')

    def get_email(self, obj):
        return self._sa(obj, 'email', '')

    def get_address(self, obj):
        return self._sa(obj, 'address', '')

    def get_deliveryMethod(self, obj):
        return self._sa(obj, 'deliveryMethod', '')

    def get_deliveryDate(self, obj):
        return self._sa(obj, 'deliveryDate', '')


class CreateOrderItemInput(serializers.Serializer):
    productId = serializers.UUIDField()
    productName = serializers.CharField(required=False)
    quantity = serializers.FloatField()
    price = serializers.FloatField()
    configs = serializers.DictField(child=serializers.JSONField(), required=False)


class CreateOrderSerializer(serializers.Serializer):
    merchant = serializers.CharField(required=False, help_text='商户slug，顾客端必传')
    customerName = serializers.CharField()
    phone = serializers.CharField()
    email = serializers.EmailField()
    address = serializers.CharField()
    deliveryMethod = serializers.CharField()
    deliveryDate = serializers.CharField()
    notes = serializers.CharField(required=False, allow_blank=True)
    items = CreateOrderItemInput(many=True)
    totalAmount = serializers.FloatField()

    def create(self, validated_data):
        request = self.context['request']
        user = request.user
        slug = validated_data.pop('merchant', None)
        merchant = None
        ms = MerchantMembership.objects.filter(user=user).first()
        if ms:
            merchant = ms.merchant
        elif slug:
            try:
                merchant = Merchant.objects.get(slug=slug)
            except Merchant.DoesNotExist:
                raise serializers.ValidationError({'merchant': '商户不存在'})
        if not merchant:
            raise serializers.ValidationError({'merchant': '缺少商户信息'})

        # 顾客与商户绑定校验/自动绑定
        try:
            cp = CustomerProfile.objects.get(user=user)
            if cp.merchant and cp.merchant != merchant:
                raise serializers.ValidationError({'merchant': '顾客不属于该商户'})
            if not cp.merchant:
                cp.merchant = merchant
                cp.save(update_fields=['merchant'])
        except CustomerProfile.DoesNotExist:
            pass

        # 订阅校验
        sub = MerchantSubscription.objects.filter(merchant=merchant).order_by('-end_date').first()
        if not sub or not sub.is_active:
            raise serializers.ValidationError({'merchant': '商户订阅已到期或未开通'})
        shipping_address = {
            'customerName': validated_data['customerName'],
            'phone': validated_data['phone'],
            'email': validated_data['email'],
            'address': validated_data['address'],
            'deliveryMethod': validated_data['deliveryMethod'],
            'deliveryDate': validated_data['deliveryDate'],
        }
        order = Order.objects.create(
            merchant=merchant,
            user=user,
            status='pending',
            total_amount=0,
            shipping_address=shipping_address,
            notes=validated_data.get('notes', ''),
        )
        items = validated_data['items']
        order_total = Decimal('0')
        for it in items:
            product = Product.objects.get(pk=it['productId'])
            cfg = it.get('configs', {}) or {}
            width = Decimal(str(cfg.get('width') or 0))
            height = Decimal(str(cfg.get('height') or 0))
            unit = str(cfg.get('unit') or 'cm')
            qty = Decimal(str(it['quantity']))

            # 面积换算
            if unit == 'mm':
                area = (width/Decimal('1000')) * (height/Decimal('1000'))
            elif unit == 'cm':
                area = (width/Decimal('100')) * (height/Decimal('100'))
            else:
                area = width * height

            base = Decimal(product.base_price)
            total_adjust = Decimal('0')
            # 选项加价（若提供 options 为 {cfgId: optionId}）
            opts = cfg.get('options') or {}
            try:
                for opt_id in opts.values():
                    if opt_id is None:
                        continue
                    opt = ConfigOption.objects.get(pk=int(opt_id))
                    total_adjust += Decimal(opt.price_adjustment)
            except Exception:
                pass

            price_per_m2 = base + total_adjust
            unit_price = (price_per_m2 * area).quantize(Decimal('0.01'))
            subtotal = (unit_price * qty).quantize(Decimal('0.01'))

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=qty,
                unit_price=unit_price,
                config_data=cfg,
                subtotal=subtotal,
            )
            order_total += subtotal

        order.total_amount = order_total
        order.save(update_fields=['total_amount'])
        return order


class OrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[s[0] for s in Order.STATUS_CHOICES])
