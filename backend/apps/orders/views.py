from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.utils.dateparse import parse_date
from django.db.models import Q

from .models import Order
from apps.users.models import MerchantMembership
from .serializers import OrderSerializer, CreateOrderSerializer, OrderStatusUpdateSerializer


class DefaultPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'pageSize'
    page_query_param = 'page'


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = DefaultPagination

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        ms = MerchantMembership.objects.filter(user=user).first()
        if ms and not user.is_superuser:
            qs = qs.filter(merchant=ms.merchant)
        user_id = self.request.query_params.get('userId')
        status_filter = self.request.query_params.get('status')
        start_date = self.request.query_params.get('startDate')
        end_date = self.request.query_params.get('endDate')
        search_text = self.request.query_params.get('searchText')

        if not user.is_staff and not user.is_superuser:
            qs = qs.filter(user=user)
        elif user_id:
            qs = qs.filter(user__id=user_id)

        if status_filter:
            qs = qs.filter(status=status_filter)

        if start_date:
            qs = qs.filter(created_at__date__gte=parse_date(start_date))
        if end_date:
            qs = qs.filter(created_at__date__lte=parse_date(end_date))

        if search_text:
            qs = qs.filter(Q(order_number__icontains=search_text))
        return qs

    def create(self, request, *args, **kwargs):
        serializer = CreateOrderSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'], url_path='status')
    def update_status(self, request, pk=None):
        order = self.get_object()
        serializer = OrderStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_status = serializer.validated_data['status']
        if order.status != new_status:
            order.status = new_status
            order.save()
        return Response(OrderSerializer(order).data)
