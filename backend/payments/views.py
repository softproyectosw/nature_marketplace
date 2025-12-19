"""
Payment API views.

This module defines API endpoints for Stripe payment processing.
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from drf_spectacular.utils import extend_schema

from .services import payment_service
from orders.services import order_service
from orders.serializers import CheckoutSerializer


class CreateCheckoutSessionView(APIView):
    """
    Create a Stripe Checkout Session for an order.
    
    This endpoint creates a Stripe Checkout Session and returns
    the session ID and URL for redirecting the user to Stripe.
    """
    
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Create checkout session",
        description="Create a Stripe Checkout Session for payment.",
        request=CheckoutSerializer,
        tags=["Payments"]
    )
    def post(self, request):
        """Create a Stripe Checkout Session."""
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        order_id = serializer.validated_data.get('order_id')
        
        # Get or create order
        if order_id:
            order = order_service.get_order(str(order_id))
            if not order or order.user != request.user:
                return Response(
                    {'error': 'Order not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            # Create order from cart first
            from orders.services import cart_service
            cart = cart_service.get_cart(user=request.user)
            result = order_service.create_order_from_cart(user=request.user, cart=cart)
            
            if not result['success']:
                return Response(
                    {'error': result['error']},
                    status=status.HTTP_400_BAD_REQUEST
                )
            order = result['order']
        
        # Check if order is already paid
        if order.is_paid:
            return Response(
                {'error': 'Order is already paid'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create Stripe Checkout Session
        result = payment_service.create_checkout_session(
            order=order,
            success_url=serializer.validated_data['success_url'],
            cancel_url=serializer.validated_data['cancel_url']
        )
        
        if result['success']:
            return Response({
                'session_id': result['session_id'],
                'url': result['url'],
                'order_id': str(order.id),
                'order_number': order.order_number,
            })
        
        return Response(
            {'error': result['error']},
            status=status.HTTP_400_BAD_REQUEST
        )


class CreatePaymentIntentView(APIView):
    """
    Create a Stripe PaymentIntent for custom payment flow.
    
    Use this for Stripe Elements integration instead of Checkout.
    """
    
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Create payment intent",
        description="Create a Stripe PaymentIntent for custom payment UI.",
        tags=["Payments"]
    )
    def post(self, request):
        """Create a Stripe PaymentIntent."""
        order_id = request.data.get('order_id')
        
        if not order_id:
            return Response(
                {'error': 'order_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order = order_service.get_order(str(order_id))
        if not order or order.user != request.user:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if order.is_paid:
            return Response(
                {'error': 'Order is already paid'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        result = payment_service.create_payment_intent(order)
        
        if result['success']:
            return Response({
                'client_secret': result['client_secret'],
                'payment_intent_id': result['payment_intent_id'],
            })
        
        return Response(
            {'error': result['error']},
            status=status.HTTP_400_BAD_REQUEST
        )


@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
    """
    Handle Stripe webhook events.
    
    This endpoint receives webhook events from Stripe and processes them.
    It must be publicly accessible and exempt from CSRF protection.
    """
    
    permission_classes = [AllowAny]
    
    @extend_schema(
        summary="Stripe webhook",
        description="Handle Stripe webhook events. Called by Stripe, not by clients.",
        tags=["Payments"]
    )
    def post(self, request):
        """Handle Stripe webhook event."""
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')
        
        if not sig_header:
            return Response(
                {'error': 'Missing Stripe signature'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        result = payment_service.handle_webhook_event(payload, sig_header)
        
        if result['success']:
            return Response({'status': 'success'})
        
        return Response(
            {'error': result.get('error', 'Webhook processing failed')},
            status=status.HTTP_400_BAD_REQUEST
        )


class PaymentStatusView(APIView):
    """
    Get payment status for an order.
    """
    
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Get payment status",
        description="Get the payment status for a specific order.",
        tags=["Payments"]
    )
    def get(self, request, order_id):
        """Get payment status for an order."""
        order = order_service.get_order(str(order_id))
        
        if not order or order.user != request.user:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        payment = payment_service.get_payment_by_order(order)
        
        if not payment:
            return Response({
                'order_id': str(order.id),
                'order_status': order.status,
                'payment_status': None,
                'is_paid': order.is_paid,
            })
        
        return Response({
            'order_id': str(order.id),
            'order_status': order.status,
            'payment_id': str(payment.id),
            'payment_status': payment.status,
            'is_paid': order.is_paid,
            'amount': str(payment.amount),
            'currency': payment.currency,
        })
