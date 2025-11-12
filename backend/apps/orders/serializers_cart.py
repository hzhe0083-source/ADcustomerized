from rest_framework import serializers
from .models import Cart, CartItem
from apps.products.models import Product


class CartItemSerializer(serializers.ModelSerializer):
    productId = serializers.UUIDField(source='product.id', read_only=True)
    productName = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'productId', 'productName', 'quantity', 'config_data', 'created_at']


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'merchant', 'created_at', 'updated_at', 'items']


class CartItemCreateSerializer(serializers.Serializer):
    merchant = serializers.CharField(required=False)
    productId = serializers.UUIDField()
    quantity = serializers.FloatField()
    configs = serializers.DictField(child=serializers.JSONField(), required=False)

    def create(self, validated_data):
        request = self.context['request']
        user = request.user
        from apps.users.models import Merchant, MerchantMembership, CustomerProfile
        slug = validated_data.get('merchant')
        merchant = None
        ms = MerchantMembership.objects.filter(user=user).first()
        if ms:
            merchant = ms.merchant
        elif slug:
            merchant = Merchant.objects.filter(slug=slug).first()
        else:
            try:
                cp = CustomerProfile.objects.get(user=user)
                merchant = cp.merchant
            except CustomerProfile.DoesNotExist:
                merchant = None

        cart, _ = Cart.objects.get_or_create(user=user, defaults={'merchant': merchant})
        if merchant and cart.merchant_id != getattr(merchant, 'id', None):
            cart.merchant = merchant
            cart.save(update_fields=['merchant'])

        product = Product.objects.get(pk=validated_data['productId'])
        item = CartItem.objects.create(
            cart=cart,
            product=product,
            quantity=validated_data['quantity'],
            config_data=validated_data.get('configs', {}),
        )
        return item

