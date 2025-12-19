"""
Admin configuration for orders app.

Registers Cart, CartItem, Order, and OrderItem models with the Django admin.
"""

from django.contrib import admin
from .models import Cart, CartItem, Order, OrderItem


class CartItemInline(admin.TabularInline):
    """Inline admin for cart items."""
    model = CartItem
    extra = 0
    readonly_fields = ['added_at', 'line_total']
    
    def line_total(self, obj):
        return obj.line_total
    line_total.short_description = 'Line Total'


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    """Admin configuration for Cart model."""
    
    list_display = ['id', 'user', 'session_key', 'total_items', 'subtotal', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['user__username', 'user__email', 'session_key']
    readonly_fields = ['created_at', 'updated_at', 'total_items', 'subtotal']
    inlines = [CartItemInline]
    
    def total_items(self, obj):
        return obj.total_items
    total_items.short_description = 'Items'
    
    def subtotal(self, obj):
        return f"${obj.subtotal}"
    subtotal.short_description = 'Subtotal'


class OrderItemInline(admin.TabularInline):
    """Inline admin for order items."""
    model = OrderItem
    extra = 0
    readonly_fields = ['product_title', 'unit_price', 'line_total', 'created_at']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """Admin configuration for Order model."""
    
    list_display = [
        'order_number',
        'user',
        'status',
        'total_amount',
        'currency',
        'created_at',
        'paid_at',
    ]
    list_filter = ['status', 'currency', 'created_at', 'paid_at']
    search_fields = ['order_number', 'user__username', 'user__email', 'customer_email']
    readonly_fields = [
        'id',
        'order_number',
        'created_at',
        'updated_at',
    ]
    inlines = [OrderItemInline]
    
    fieldsets = (
        ('Order Information', {
            'fields': ('id', 'order_number', 'user', 'status')
        }),
        ('Amounts', {
            'fields': ('subtotal', 'discount_amount', 'tax_amount', 'total_amount', 'currency')
        }),
        ('Customer', {
            'fields': ('customer_email', 'customer_name')
        }),
        ('Notes', {
            'fields': ('customer_notes', 'internal_notes'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'paid_at', 'fulfilled_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_paid', 'mark_as_fulfilled']
    
    @admin.action(description='Mark selected orders as paid')
    def mark_as_paid(self, request, queryset):
        from django.utils import timezone
        queryset.update(status=Order.OrderStatus.PAID, paid_at=timezone.now())
    
    @admin.action(description='Mark selected orders as fulfilled')
    def mark_as_fulfilled(self, request, queryset):
        from django.utils import timezone
        queryset.update(status=Order.OrderStatus.FULFILLED, fulfilled_at=timezone.now())
