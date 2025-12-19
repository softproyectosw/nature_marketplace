"""
Admin configuration for payments app.

Registers Payment model with the Django admin.
"""

from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """Admin configuration for Payment model."""
    
    list_display = [
        'id',
        'order',
        'user',
        'status',
        'amount',
        'currency',
        'payment_method',
        'card_brand',
        'card_last_four',
        'created_at',
    ]
    list_filter = [
        'status',
        'payment_method',
        'currency',
        'card_brand',
        'created_at',
    ]
    search_fields = [
        'id',
        'order__order_number',
        'user__username',
        'user__email',
        'stripe_payment_intent_id',
        'stripe_checkout_session_id',
    ]
    readonly_fields = [
        'id',
        'created_at',
        'updated_at',
        'completed_at',
    ]
    
    fieldsets = (
        ('Identification', {
            'fields': ('id', 'order', 'user')
        }),
        ('Stripe', {
            'fields': (
                'stripe_payment_intent_id',
                'stripe_checkout_session_id',
                'stripe_customer_id',
                'stripe_charge_id',
            )
        }),
        ('Payment Details', {
            'fields': (
                'status',
                'payment_method',
                'amount',
                'currency',
                'refunded_amount',
            )
        }),
        ('Card Info', {
            'fields': ('card_brand', 'card_last_four'),
            'classes': ('collapse',)
        }),
        ('Errors', {
            'fields': ('error_code', 'error_message'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'completed_at'),
            'classes': ('collapse',)
        }),
    )
    
    def has_add_permission(self, request):
        """Payments should only be created via Stripe webhooks."""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Payments should never be deleted for audit purposes."""
        return False
