from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Cart, CartItem
from .serializers_cart import CartSerializer, CartItemSerializer, CartItemCreateSerializer
from apps.users.models import MerchantMembership


class CartViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        return Response(CartSerializer(cart).data)

    @action(detail=False, methods=['delete'])
    def clear(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        CartItem.objects.filter(cart=cart).delete()
        return Response({'ok': True})


class CartItemViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer

    def get_queryset(self):
        cart, _ = Cart.objects.get_or_create(user=self.request.user)
        return CartItem.objects.filter(cart=cart).order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'create':
            return CartItemCreateSerializer
        return CartItemSerializer

    def create(self, request, *args, **kwargs):
        ser = CartItemCreateSerializer(data=request.data, context={'request': request})
        ser.is_valid(raise_exception=True)
        item = ser.save()
        return Response(CartItemSerializer(item).data, status=status.HTTP_201_CREATED)

