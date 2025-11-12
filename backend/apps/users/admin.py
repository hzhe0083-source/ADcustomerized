from django.contrib import admin
from django.contrib.auth import get_user_model
from .models import CustomerProfile, EmployeeProfile


User = get_user_model()


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role', 'is_active', 'date_joined')
    search_fields = ('username', 'email')
    list_filter = ('role', 'is_active')


@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'contact_person', 'contact_phone', 'credit_limit', 'used_credit')


@admin.register(EmployeeProfile)
class EmployeeProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'employee_id', 'department', 'position', 'is_active')

