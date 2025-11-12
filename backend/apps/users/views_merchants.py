from datetime import date, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework import viewsets

from .models import Merchant, MerchantMembership, MerchantSubscriptionPlan, MerchantSubscription
from .serializers_merchants import (
    MerchantSerializer, MerchantPlanSerializer, MerchantSubscriptionSerializer, SubscribeInputSerializer
)


def get_user_merchant(user):
    ms = MerchantMembership.objects.filter(user=user).first()
    return ms.merchant if ms else None


class MerchantMeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        merchant = get_user_merchant(request.user)
        if not merchant:
            return Response({'merchant': None})
        sub = MerchantSubscription.objects.filter(merchant=merchant).order_by('-end_date').first()
        return Response({
            'merchant': MerchantSerializer(merchant).data,
            'subscription': MerchantSubscriptionSerializer(sub).data if sub else None,
            'active': bool(sub and sub.is_active),
        })


class MerchantPlanViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MerchantSubscriptionPlan.objects.filter(is_active=True).order_by('monthly_price')
    serializer_class = MerchantPlanSerializer
    permission_classes = [permissions.AllowAny]


class MerchantSubscribeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        merchant = get_user_merchant(request.user)
        if not merchant:
            return Response({'detail': '当前用户未绑定商户'}, status=400)
        # 仅管理员可开通
        if not MerchantMembership.objects.filter(user=request.user, merchant=merchant, role='admin').exists():
            return Response({'detail': '无权限'}, status=403)

        ser = SubscribeInputSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data
        # 仅支持年费与试用，年费固定 60000/年
        if data['period'] == 'trial':
            days = data.get('trial_days', 14)
            plan, _ = MerchantSubscriptionPlan.objects.get_or_create(
                code='vip_60k',
                defaults={
                    'name': '年费会员',
                    'monthly_price': 0,
                    'yearly_price': 60000,
                    'features': ['mall', 'catalog', 'pricing', 'orders'],
                    'is_active': True,
                },
            )
            start = date.today()
            end = start + timedelta(days=days)
        else:
            plan, _ = MerchantSubscriptionPlan.objects.get_or_create(
                code='vip_60k',
                defaults={
                    'name': '年费会员',
                    'monthly_price': 0,
                    'yearly_price': 60000,
                    'features': ['mall', 'catalog', 'pricing', 'orders'],
                    'is_active': True,
                },
            )
            start = date.today()
            end = start + timedelta(days=365)

        sub = MerchantSubscription.objects.create(
            merchant=merchant,
            plan=plan,
            status='active',
            start_date=start,
            end_date=end,
        )
        return Response(MerchantSubscriptionSerializer(sub).data)


class MerchantBootstrapView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # 如果当前用户已绑定商户，直接返回
        ms = MerchantMembership.objects.filter(user=request.user).first()
        if ms:
            return Response({'merchant': MerchantSerializer(ms.merchant).data})

        # 创建商户与管理员成员
        base = (request.user.company or request.user.username or 'merchant').strip() or 'merchant'
        import re, uuid
        slug_base = re.sub(r'[^a-zA-Z0-9]+', '-', base).lower().strip('-') or 'merchant'
        slug = slug_base
        i = 0
        while Merchant.objects.filter(slug=slug).exists():
            i += 1
            slug = f"{slug_base}-{i}"
        merchant = Merchant.objects.create(name=base, slug=slug, is_active=True)
        MerchantMembership.objects.create(user=request.user, merchant=merchant, role='admin')
        return Response({'merchant': MerchantSerializer(merchant).data})


class MerchantPublicView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        try:
            m = Merchant.objects.get(slug=slug, is_active=True)
        except Merchant.DoesNotExist:
            return Response({'detail': '商户不存在'}, status=404)
        return Response(MerchantSerializer(m).data)
