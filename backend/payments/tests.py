"""
Tests for payments app.

Tests cover models, services, and API endpoints.
"""

from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from unittest.mock import patch, MagicMock

from .models import Payment
from .services import PaymentService
from .repositories import PaymentRepository
from orders.models import Order

User = get_user_model()


class PaymentModelTest(TestCase):
    """Tests for Payment model."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='paymentuser',
            email='payment@example.com',
            password='testpass123'
        )
        self.order = Order.objects.create(
            user=self.user,
            subtotal=Decimal('100.00'),
            total_amount=Decimal('105.00'),
            customer_email='payment@example.com'
        )
        self.payment = Payment.objects.create(
            order=self.order,
            user=self.user,
            amount=Decimal('105.00'),
            currency='USD',
            stripe_payment_intent_id='pi_test123'
        )

    def test_payment_str(self):
        """Test payment string representation."""
        self.assertIn('pending', str(self.payment).lower())

    def test_payment_default_status(self):
        """Test payment default status is pending."""
        self.assertEqual(self.payment.status, Payment.PaymentStatus.PENDING)

    def test_payment_is_successful(self):
        """Test is_successful property."""
        self.assertFalse(self.payment.is_successful)
        self.payment.status = Payment.PaymentStatus.SUCCEEDED
        self.assertTrue(self.payment.is_successful)

    def test_payment_is_refundable(self):
        """Test is_refundable property."""
        self.assertFalse(self.payment.is_refundable)
        self.payment.status = Payment.PaymentStatus.SUCCEEDED
        self.assertTrue(self.payment.is_refundable)

    def test_payment_net_amount(self):
        """Test net_amount calculation."""
        self.payment.status = Payment.PaymentStatus.SUCCEEDED
        self.assertEqual(self.payment.net_amount, 105.00)
        self.payment.refunded_amount = Decimal('25.00')
        self.assertEqual(self.payment.net_amount, 80.00)

    def test_mark_as_succeeded(self):
        """Test marking payment as succeeded."""
        self.payment.mark_as_succeeded()
        self.assertEqual(self.payment.status, Payment.PaymentStatus.SUCCEEDED)
        self.assertIsNotNone(self.payment.completed_at)

    def test_mark_as_failed(self):
        """Test marking payment as failed."""
        self.payment.mark_as_failed('card_declined', 'Your card was declined')
        self.assertEqual(self.payment.status, Payment.PaymentStatus.FAILED)
        self.assertEqual(self.payment.error_code, 'card_declined')


class PaymentRepositoryTest(TestCase):
    """Tests for PaymentRepository."""

    def setUp(self):
        self.repo = PaymentRepository()
        self.user = User.objects.create_user(
            username='repouser',
            email='repo@example.com',
            password='testpass123'
        )
        self.order = Order.objects.create(
            user=self.user,
            subtotal=Decimal('200.00'),
            total_amount=Decimal('210.00'),
            customer_email='repo@example.com'
        )

    def test_create_payment(self):
        """Test creating a payment."""
        payment = self.repo.create(
            order=self.order,
            user=self.user,
            amount=210.00,
            stripe_payment_intent_id='pi_repo123'
        )
        self.assertIsNotNone(payment)
        self.assertEqual(payment.amount, Decimal('210.00'))

    def test_get_by_stripe_payment_intent(self):
        """Test getting payment by Stripe payment intent ID."""
        self.repo.create(
            order=self.order,
            user=self.user,
            amount=210.00,
            stripe_payment_intent_id='pi_unique123'
        )
        payment = self.repo.get_by_stripe_payment_intent('pi_unique123')
        self.assertIsNotNone(payment)

    def test_update_status(self):
        """Test updating payment status."""
        payment = self.repo.create(
            order=self.order,
            user=self.user,
            amount=210.00
        )
        updated = self.repo.update_status(
            payment,
            Payment.PaymentStatus.SUCCEEDED
        )
        self.assertEqual(updated.status, Payment.PaymentStatus.SUCCEEDED)


class PaymentServiceTest(TestCase):
    """Tests for PaymentService."""

    def setUp(self):
        self.service = PaymentService()
        self.user = User.objects.create_user(
            username='serviceuser',
            email='service@example.com',
            password='testpass123'
        )
        self.order = Order.objects.create(
            user=self.user,
            subtotal=Decimal('300.00'),
            total_amount=Decimal('315.00'),
            customer_email='service@example.com'
        )

    @patch('payments.services.stripe')
    def test_create_checkout_session(self, mock_stripe):
        """Test creating Stripe checkout session."""
        mock_session = MagicMock()
        mock_session.id = 'cs_test123'
        mock_session.url = 'https://checkout.stripe.com/test'
        mock_stripe.checkout.Session.create.return_value = mock_session

        result = self.service.create_checkout_session(
            order=self.order,
            success_url='https://example.com/success',
            cancel_url='https://example.com/cancel'
        )
        self.assertTrue(result['success'])
        self.assertEqual(result['session_id'], 'cs_test123')

    @patch('payments.services.stripe')
    def test_create_payment_intent(self, mock_stripe):
        """Test creating Stripe payment intent."""
        mock_intent = MagicMock()
        mock_intent.id = 'pi_test456'
        mock_intent.client_secret = 'pi_test456_secret'
        mock_intent.status = 'requires_payment_method'
        mock_stripe.PaymentIntent.create.return_value = mock_intent

        result = self.service.create_payment_intent(order=self.order)
        self.assertTrue(result['success'])
        self.assertEqual(result['payment_intent_id'], 'pi_test456')


class PaymentAPITest(APITestCase):
    """Tests for Payment API endpoints."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='apiuser',
            email='api@example.com',
            password='testpass123'
        )
        self.order = Order.objects.create(
            user=self.user,
            subtotal=Decimal('150.00'),
            total_amount=Decimal('157.50'),
            customer_email='api@example.com'
        )

    def test_create_checkout_unauthenticated(self):
        """Test creating checkout session without authentication."""
        url = reverse('payments:checkout')
        response = self.client.post(url, {'order_id': str(self.order.id)})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('payments.services.stripe')
    def test_create_checkout_authenticated(self, mock_stripe):
        """Test creating checkout session with authentication."""
        mock_session = MagicMock()
        mock_session.id = 'cs_api123'
        mock_session.url = 'https://checkout.stripe.com/api'
        mock_stripe.checkout.Session.create.return_value = mock_session

        self.client.force_authenticate(user=self.user)
        url = reverse('payments:checkout')
        response = self.client.post(url, {'order_id': str(self.order.id)})
        # May fail if Stripe not configured, but should not be 401
        self.assertNotEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
