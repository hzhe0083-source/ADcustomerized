from rest_framework import serializers
from .models import Merchant, MerchantMembership, MerchantSubscriptionPlan, MerchantSubscription


class MerchantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Merchant
        fields = ['id', 'name', 'slug', 'logo', 'is_active', 'created_at', 'updated_at']


class MerchantPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = MerchantSubscriptionPlan
        fields = ['id', 'name', 'code', 'monthly_price', 'yearly_price', 'features', 'is_active']


class MerchantSubscriptionSerializer(serializers.ModelSerializer):
    plan = MerchantPlanSerializer(read_only=True)

    class Meta:
        model = MerchantSubscription
        fields = ['id', 'status', 'start_date', 'end_date', 'plan']


class SubscribeInputSerializer(serializers.Serializer):
    plan_code = serializers.CharField()
    period = serializers.ChoiceField(choices=['yearly', 'trial'])
    trial_days = serializers.IntegerField(required=False, min_value=1, max_value=30)
