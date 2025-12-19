"""
Payment serializers for Nature Marketplace.

This module provides serializers for Payment model data transformation.
"""

from rest_framework import serializers

from .models import Payment
from orders.serializers import OrderListSerializer


class PaymentListSerializer(serializers.ModelSerializer):
    """Serializer for payment list view."""
    
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id',
            'order_number',
            'status',
            'payment_method',
            'amount',
            'currency',
            'card_brand',
            'card_last_four',
            'created_at',
            'completed_at',
        ]


class PaymentDetailSerializer(serializers.ModelSerializer):
    """Serializer for payment detail view."""
    
    order = OrderListSerializer(read_only=True)
    is_successful = serializers.BooleanField(read_only=True)
    is_refundable = serializers.BooleanField(read_only=True)
    net_amount = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id',
            'order',
            'status',
            'payment_method',
            'amount',
            'currency',
            'refunded_amount',
            'net_amount',
            'card_brand',
            'card_last_four',
            'stripe_payment_intent_id',
            'is_successful',
            'is_refundable',
            'error_code',
            'error_message',
            'created_at',
            'completed_at',
        ]


class CreateCheckoutSessionSerializer(serializers.Serializer):
    """Serializer for creating Stripe checkout session."""
    
    order_id = serializers.UUIDField(required=True)
    success_url = serializers.URLField(required=False)
    cancel_url = serializers.URLField(required=False)
    
    def validate_order_id(self, value):
        """Validate that order exists and is payable."""
        from orders.models import Order
        try:
            order = Order.objects.get(id=value)
        except Order.DoesNotExist:
            raise serializers.ValidationError("Order not found.")
        
        if order.is_paid:
            raise serializers.ValidationError("Order is already paid.")
        
        if order.status == Order.OrderStatus.CANCELLED:
            raise serializers.ValidationError("Cannot pay for cancelled order.")
        
        return value


class CreatePaymentIntentSerializer(serializers.Serializer):
    """Serializer for creating Stripe payment intent."""
    
    order_id = serializers.UUIDField(required=True)
    payment_method_id = serializers.CharField(required=False, allow_blank=True)
    
    def validate_order_id(self, value):
        """Validate that order exists and is payable."""
        from orders.models import Order
        try:
            order = Order.objects.get(id=value)
        except Order.DoesNotExist:
            raise serializers.ValidationError("Order not found.")
        
        if order.is_paid:
            raise serializers.ValidationError("Order is already paid.")
        
        return value


class RefundSerializer(serializers.Serializer):
    """Serializer for processing refunds."""
    
    payment_id = serializers.UUIDField(required=True)
    amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        allow_null=True
    )
    reason = serializers.CharField(max_length=500, required=False, allow_blank=True)
    
    def validate(self, data):
        """Validate refund request."""
        try:
            payment = Payment.objects.get(id=data['payment_id'])
        except Payment.DoesNotExist:
            raise serializers.ValidationError({"payment_id": "Payment not found."})
        
        if not payment.is_refundable:
            raise serializers.ValidationError(
                {"payment_id": "This payment cannot be refunded."}
            )
        
        amount = data.get('amount')
        if amount:
            max_refundable = payment.amount - payment.refunded_amount
            if amount > max_refundable:
                raise serializers.ValidationError(
                    {"amount": f"Maximum refundable amount is {max_refundable}."}
                )
        
        data['payment'] = payment
        return data


class WebhookEventSerializer(serializers.Serializer):
    """Serializer for Stripe webhook events."""
    
    id = serializers.CharField()
    type = serializers.CharField()
    data = serializers.DictField()
    created = serializers.IntegerField()
