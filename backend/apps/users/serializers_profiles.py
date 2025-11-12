from rest_framework import serializers
from .models import CustomerProfile, EmployeeProfile, User


class UserBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "role")


class CustomerProfileSerializer(serializers.ModelSerializer):
    user = UserBriefSerializer(read_only=True)
    user_id = serializers.UUIDField(source="user.id", read_only=True)
    creditLimit = serializers.DecimalField(source="credit_limit", max_digits=10, decimal_places=2)
    usedCredit = serializers.DecimalField(source="used_credit", max_digits=10, decimal_places=2)
    shippingAddresses = serializers.JSONField(source="shipping_addresses")
    merchant = serializers.SerializerMethodField()

    class Meta:
        model = CustomerProfile
        fields = (
            "id", "user", "user_id", "merchant", "contact_person", "contact_phone",
            "shippingAddresses", "creditLimit", "usedCredit",
        )

    def get_merchant(self, obj):
        m = getattr(obj, 'merchant', None)
        if not m:
            return None
        return { 'id': str(m.id), 'name': m.name, 'slug': m.slug }


class EmployeeProfileSerializer(serializers.ModelSerializer):
    user = UserBriefSerializer(read_only=True)
    user_id = serializers.UUIDField(source="user.id", read_only=True)
    employeeId = serializers.CharField(source="employee_id")
    hireDate = serializers.DateField(source="hire_date")
    isActive = serializers.BooleanField(source="is_active")

    class Meta:
        model = EmployeeProfile
        fields = (
            "id", "user", "user_id", "employeeId", "department", "position",
            "hireDate", "isActive",
        )
