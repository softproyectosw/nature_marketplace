"""
Product repository for data access operations.

This module abstracts database operations for Product and Category models.
Services should use repositories instead of accessing models directly.
"""

from typing import Optional
from django.db.models import QuerySet, Q

from .models import Product, Category


class CategoryRepository:
    """Repository for Category data access operations."""
    
    @staticmethod
    def get_all_active() -> QuerySet[Category]:
        """Get all active categories ordered by display order."""
        return Category.objects.filter(is_active=True).order_by('display_order', 'name')
    
    @staticmethod
    def get_by_slug(slug: str) -> Optional[Category]:
        """Get a category by its slug."""
        try:
            return Category.objects.get(slug=slug, is_active=True)
        except Category.DoesNotExist:
            return None
    
    @staticmethod
    def get_by_id(category_id: int) -> Optional[Category]:
        """Get a category by its ID."""
        try:
            return Category.objects.get(id=category_id)
        except Category.DoesNotExist:
            return None


class ProductRepository:
    """Repository for Product data access operations."""
    
    @staticmethod
    def get_all_active() -> QuerySet[Product]:
        """Get all active products."""
        return Product.objects.filter(is_active=True).select_related('category')
    
    @staticmethod
    def get_by_id(product_id: int) -> Optional[Product]:
        """Get a product by its ID."""
        try:
            return Product.objects.select_related('category').get(id=product_id)
        except Product.DoesNotExist:
            return None
    
    @staticmethod
    def get_by_slug(slug: str) -> Optional[Product]:
        """Get a product by its slug."""
        try:
            return Product.objects.select_related('category').get(
                slug=slug,
                is_active=True
            )
        except Product.DoesNotExist:
            return None
    
    @staticmethod
    def get_featured(limit: int = 10) -> QuerySet[Product]:
        """Get featured products."""
        return (
            Product.objects
            .filter(is_active=True, is_featured=True)
            .select_related('category')
            .order_by('-created_at')[:limit]
        )
    
    @staticmethod
    def get_new_arrivals(limit: int = 10) -> QuerySet[Product]:
        """Get new arrival products."""
        return (
            Product.objects
            .filter(is_active=True, is_new=True)
            .select_related('category')
            .order_by('-created_at')[:limit]
        )
    
    @staticmethod
    def get_by_category(category_slug: str) -> QuerySet[Product]:
        """Get all active products in a category."""
        return (
            Product.objects
            .filter(is_active=True, category__slug=category_slug)
            .select_related('category')
            .order_by('-created_at')
        )
    
    @staticmethod
    def get_by_type(product_type: str) -> QuerySet[Product]:
        """Get all active products of a specific type."""
        return (
            Product.objects
            .filter(is_active=True, product_type=product_type)
            .select_related('category')
            .order_by('-created_at')
        )
    
    @staticmethod
    def search(query: str) -> QuerySet[Product]:
        """Search products by title, description, or features."""
        return (
            Product.objects
            .filter(
                is_active=True
            )
            .filter(
                Q(title__icontains=query) |
                Q(description__icontains=query) |
                Q(short_description__icontains=query) |
                Q(species__icontains=query)
            )
            .select_related('category')
            .order_by('-created_at')
        )
    
    @staticmethod
    def get_trees() -> QuerySet[Product]:
        """Get all active tree products."""
        return ProductRepository.get_by_type(Product.ProductType.TREE)
    
    @staticmethod
    def get_retreats() -> QuerySet[Product]:
        """Get all active retreat products."""
        return ProductRepository.get_by_type(Product.ProductType.RETREAT)
    
    @staticmethod
    def decrement_stock(product_id: int, quantity: int = 1) -> bool:
        """
        Decrement product stock by quantity.
        
        Returns True if successful, False if insufficient stock.
        """
        try:
            product = Product.objects.get(id=product_id)
            if product.is_unlimited_stock:
                return True
            if product.stock >= quantity:
                product.stock -= quantity
                product.save(update_fields=['stock'])
                return True
            return False
        except Product.DoesNotExist:
            return False
