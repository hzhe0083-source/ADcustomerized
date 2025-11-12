from datetime import datetime, timedelta
from django.db import models
from django.db.models import Sum, Count
from django.db.models.functions import TruncDate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.orders.models import Order, OrderItem
from apps.products.models import Material
from apps.equipment.models import Equipment
from apps.production.models import ProductionPlan


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        now = datetime.now()
        start_30 = now - timedelta(days=30)
        start_14 = now - timedelta(days=14)
        start_7 = now - timedelta(days=7)

        # Revenue and orders
        revenue_total = Order.objects.aggregate(v=Sum('total_amount'))['v'] or 0
        revenue_30 = Order.objects.filter(created_at__gte=start_30).aggregate(v=Sum('total_amount'))['v'] or 0
        revenue_7 = Order.objects.filter(created_at__gte=start_7).aggregate(v=Sum('total_amount'))['v'] or 0
        orders_total = Order.objects.count()
        orders_30 = Order.objects.filter(created_at__gte=start_30).count()
        orders_7 = Order.objects.filter(created_at__gte=start_7).count()

        # By status
        status_counts = dict(Order.objects.values_list('status').annotate(c=Count('id')).values_list('status', 'c'))

        # Top products by sales amount (last 30 days)
        top_products_qs = (
            OrderItem.objects.filter(order__created_at__gte=start_30)
            .values('product__name')
            .annotate(amount=Sum('subtotal'))
            .order_by('-amount')[:5]
        )
        top_products = [{'name': i['product__name'], 'amount': float(i['amount'] or 0)} for i in top_products_qs]

        # Low stock materials
        low_stock_count = Material.objects.filter(is_active=True, stock_quantity__lt=models.F('min_stock')).count()

        # Equipment status
        equipment_counts = dict(Equipment.objects.values_list('status').annotate(c=Count('id')).values_list('status', 'c'))

        # Production plan status
        plan_counts = dict(ProductionPlan.objects.values_list('status').annotate(c=Count('id')).values_list('status', 'c'))

        # Daily series last 14d
        daily_qs = (
            Order.objects.filter(created_at__date__gte=start_14.date())
            .annotate(d=TruncDate('created_at'))
            .values('d')
            .annotate(orders=Count('id'), revenue=Sum('total_amount'))
            .order_by('d')
        )
        daily = [{'date': x['d'].isoformat(), 'orders': x['orders'], 'revenue': float(x['revenue'] or 0)} for x in daily_qs]

        # Baseline forecast (naive): next 7 days = 7日平均
        avg_orders = orders_7 / 7 if orders_7 else 0
        avg_revenue = revenue_7 / 7 if revenue_7 else 0
        forecast = [{'day': i, 'orders': round(avg_orders, 2), 'revenue': round(float(avg_revenue), 2)} for i in range(1, 8)]

        return Response({
            'revenue_total': float(revenue_total),
            'revenue_30': float(revenue_30),
            'revenue_7': float(revenue_7),
            'orders_total': orders_total,
            'orders_30': orders_30,
            'orders_7': orders_7,
            'status_counts': status_counts,
            'top_products': top_products,
            'low_stock_count': low_stock_count,
            'equipment_counts': equipment_counts,
            'plan_counts': plan_counts,
            'daily': daily,
            'forecast': forecast,
        })
