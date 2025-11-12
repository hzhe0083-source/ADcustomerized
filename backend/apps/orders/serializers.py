from rest_framework import serializers
from django.conf import settings
from .models import Order, OrderItem, OrderStatusHistory
from apps.products.models import Product


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
        shipping_address = {
            'customerName': validated_data['customerName'],
            'phone': validated_data['phone'],
            'email': validated_data['email'],
            'address': validated_data['address'],
            'deliveryMethod': validated_data['deliveryMethod'],
            'deliveryDate': validated_data['deliveryDate'],
        }
        order = Order.objects.create(
            user=user,
            status='pending',
            total_amount=validated_data['totalAmount'],
            shipping_address=shipping_address,
            notes=validated_data.get('notes', ''),
        )
        items = validated_data['items']
        for it in items:
            product = Product.objects.get(pk=it['productId'])
            subtotal = float(it['price']) * float(it['quantity'])
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=it['quantity'],
                unit_price=it['price'],
                config_data=it.get('configs', {}),
                subtotal=subtotal,
            )
        return order


class OrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[s[0] for s in Order.STATUS_CHOICES])
