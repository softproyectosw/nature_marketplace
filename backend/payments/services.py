"""
Payment service for Stripe integration.

This module handles payment processing with Stripe.
"""

import stripe
from typing import Optional
from decimal import Decimal
from django.conf import settings
from django.db import transaction

from .models import Payment
from orders.models import Order
from orders.services import order_service
from ecosystems.services import ecosystem_service

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


class PaymentService:
    """Service for payment processing with Stripe."""
    
    def create_checkout_session(
        self,
        order: Order,
        success_url: str,
        cancel_url: str
    ) -> dict:
        """
        Create a Stripe Checkout Session for an order.
        
        Args:
            order: The order to pay for
            success_url: URL to redirect on success
            cancel_url: URL to redirect on cancel
        
        Returns:
            Dict with session_id and url, or error
        """
        try:
            # Build line items from order
            line_items = []
            for item in order.items.all():
                line_items.append({
                    'price_data': {
                        'currency': order.currency.lower(),
                        'product_data': {
                            'name': item.product_title,
                            'description': item.product.short_description[:500] if item.product else '',
                        },
                        'unit_amount': int(item.unit_price * 100),  # Stripe uses cents
                    },
                    'quantity': item.quantity,
                })
            
            # Create Stripe Checkout Session
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=line_items,
                mode='payment',
                success_url=success_url,
                cancel_url=cancel_url,
                customer_email=order.customer_email,
                metadata={
                    'order_id': str(order.id),
                    'order_number': order.order_number,
                },
                payment_intent_data={
                    'metadata': {
                        'order_id': str(order.id),
                        'order_number': order.order_number,
                    }
                }
            )
            
            # Create payment record
            Payment.objects.create(
                order=order,
                user=order.user,
                stripe_checkout_session_id=session.id,
                amount=order.total_amount,
                currency=order.currency,
                status=Payment.PaymentStatus.PENDING
            )
            
            return {
                'success': True,
                'session_id': session.id,
                'url': session.url
            }
            
        except stripe.error.StripeError as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def create_payment_intent(self, order: Order) -> dict:
        """
        Create a Stripe PaymentIntent for custom payment flow.
        
        Use this for Stripe Elements integration instead of Checkout.
        """
        try:
            intent = stripe.PaymentIntent.create(
                amount=int(order.total_amount * 100),
                currency=order.currency.lower(),
                metadata={
                    'order_id': str(order.id),
                    'order_number': order.order_number,
                },
            )
            
            # Create payment record
            Payment.objects.create(
                order=order,
                user=order.user,
                stripe_payment_intent_id=intent.id,
                amount=order.total_amount,
                currency=order.currency,
                status=Payment.PaymentStatus.PENDING
            )
            
            return {
                'success': True,
                'client_secret': intent.client_secret,
                'payment_intent_id': intent.id
            }
            
        except stripe.error.StripeError as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    @transaction.atomic
    def handle_webhook_event(self, payload: bytes, sig_header: str) -> dict:
        """
        Handle Stripe webhook events.
        
        Args:
            payload: Raw request body
            sig_header: Stripe signature header
        
        Returns:
            Dict with success status
        """
        try:
            event = stripe.Webhook.construct_event(
                payload,
                sig_header,
                settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError:
            return {'success': False, 'error': 'Invalid payload'}
        except stripe.error.SignatureVerificationError:
            return {'success': False, 'error': 'Invalid signature'}
        
        # Handle the event
        if event['type'] == 'checkout.session.completed':
            return self._handle_checkout_completed(event['data']['object'])
        
        elif event['type'] == 'payment_intent.succeeded':
            return self._handle_payment_succeeded(event['data']['object'])
        
        elif event['type'] == 'payment_intent.payment_failed':
            return self._handle_payment_failed(event['data']['object'])
        
        # Unhandled event type
        return {'success': True, 'message': f"Unhandled event type: {event['type']}"}
    
    def _handle_checkout_completed(self, session: dict) -> dict:
        """Handle successful checkout session."""
        try:
            payment = Payment.objects.get(
                stripe_checkout_session_id=session['id']
            )
            
            # Update payment record
            payment.stripe_payment_intent_id = session.get('payment_intent')
            payment.mark_as_succeeded()
            
            # Update order status
            order_service.mark_as_paid(payment.order)
            
            # Create adopted trees for tree products
            self._process_tree_adoptions(payment.order)
            
            return {'success': True}
            
        except Payment.DoesNotExist:
            return {'success': False, 'error': 'Payment not found'}
    
    def _handle_payment_succeeded(self, payment_intent: dict) -> dict:
        """Handle successful payment intent."""
        try:
            payment = Payment.objects.get(
                stripe_payment_intent_id=payment_intent['id']
            )
            
            # Update payment with card details
            if payment_intent.get('charges', {}).get('data'):
                charge = payment_intent['charges']['data'][0]
                payment.stripe_charge_id = charge['id']
                
                if charge.get('payment_method_details', {}).get('card'):
                    card = charge['payment_method_details']['card']
                    payment.card_last_four = card.get('last4', '')
                    payment.card_brand = card.get('brand', '')
            
            payment.mark_as_succeeded()
            
            # Update order status
            order_service.mark_as_paid(payment.order)
            
            # Create adopted trees
            self._process_tree_adoptions(payment.order)
            
            return {'success': True}
            
        except Payment.DoesNotExist:
            return {'success': False, 'error': 'Payment not found'}
    
    def _handle_payment_failed(self, payment_intent: dict) -> dict:
        """Handle failed payment."""
        try:
            payment = Payment.objects.get(
                stripe_payment_intent_id=payment_intent['id']
            )
            
            error = payment_intent.get('last_payment_error', {})
            payment.mark_as_failed(
                error_code=error.get('code', ''),
                error_message=error.get('message', 'Payment failed')
            )
            
            return {'success': True}
            
        except Payment.DoesNotExist:
            return {'success': False, 'error': 'Payment not found'}
    
    def _process_tree_adoptions(self, order: Order) -> None:
        """Create adopted trees for tree products in an order."""
        from products.models import Product
        
        for item in order.items.all():
            if item.product.product_type == Product.ProductType.TREE:
                # Create adopted tree for each quantity
                for _ in range(item.quantity):
                    ecosystem_service.create_adopted_tree(
                        user=order.user,
                        order_item=item,
                        nickname=item.selected_options.get('nickname', '')
                    )
    
    def get_payment_by_order(self, order: Order) -> Optional[Payment]:
        """Get the payment for an order."""
        return order.payments.order_by('-created_at').first()
    
    def refund_payment(self, payment: Payment, amount: Optional[Decimal] = None) -> dict:
        """
        Refund a payment.
        
        Args:
            payment: Payment to refund
            amount: Amount to refund (None for full refund)
        
        Returns:
            Dict with success status
        """
        if not payment.is_refundable:
            return {'success': False, 'error': 'Payment is not refundable'}
        
        refund_amount = amount or payment.net_amount
        
        try:
            stripe.Refund.create(
                payment_intent=payment.stripe_payment_intent_id,
                amount=int(refund_amount * 100)
            )
            
            payment.refunded_amount += Decimal(str(refund_amount))
            
            if payment.refunded_amount >= payment.amount:
                payment.status = Payment.PaymentStatus.REFUNDED
            else:
                payment.status = Payment.PaymentStatus.PARTIALLY_REFUNDED
            
            payment.save()
            
            return {'success': True, 'refunded_amount': refund_amount}
            
        except stripe.error.StripeError as e:
            return {'success': False, 'error': str(e)}


# Singleton instance
payment_service = PaymentService()
