"""
Product service for business logic operations.

This module contains business logic for product-related operations.
Services orchestrate repositories and apply business rules.
"""

from typing import Optional
from django.db.models import QuerySet

from .models import Product, Category
from .repositories import ProductRepository, CategoryRepository


class ProductService:
    """Service for product business logic."""
    
    def __init__(self):
        self.product_repo = ProductRepository
        self.category_repo = CategoryRepository
    
    def get_all_products(self) -> QuerySet[Product]:
        """Get all active products."""
        return self.product_repo.get_all_active()
    
    def get_product_by_slug(self, slug: str) -> Optional[Product]:
        """Get a product by its slug."""
        return self.product_repo.get_by_slug(slug)
    
    def get_product_by_id(self, product_id: int) -> Optional[Product]:
        """Get a product by its ID."""
        return self.product_repo.get_by_id(product_id)
    
    def get_featured_products(self, limit: int = 10) -> QuerySet[Product]:
        """Get featured products for homepage."""
        return self.product_repo.get_featured(limit)
    
    def get_new_arrivals(self, limit: int = 10) -> QuerySet[Product]:
        """Get new arrival products."""
        return self.product_repo.get_new_arrivals(limit)
    
    def get_products_by_category(self, category_slug: str) -> QuerySet[Product]:
        """Get all products in a category."""
        return self.product_repo.get_by_category(category_slug)
    
    def get_trees(self) -> QuerySet[Product]:
        """Get all tree products for adoption."""
        return self.product_repo.get_trees()
    
    def get_retreats(self) -> QuerySet[Product]:
        """Get all retreat products."""
        return self.product_repo.get_retreats()
    
    def search_products(self, query: str) -> QuerySet[Product]:
        """Search products by query string."""
        if not query or len(query) < 2:
            return Product.objects.none()
        return self.product_repo.search(query)
    
    def check_availability(self, product_id: int, quantity: int = 1) -> bool:
        """
        Check if a product is available in the requested quantity.
        
        Returns True if product is available, False otherwise.
        """
        product = self.product_repo.get_by_id(product_id)
        if not product:
            return False
        
        if not product.is_active:
            return False
        
        if product.is_unlimited_stock:
            return True
        
        return product.stock >= quantity
    
    def reserve_stock(self, product_id: int, quantity: int = 1) -> bool:
        """
        Reserve stock for a product (decrement stock).
        
        Returns True if successful, False if insufficient stock.
        """
        return self.product_repo.decrement_stock(product_id, quantity)


class CategoryService:
    """Service for category business logic."""
    
    def __init__(self):
        self.category_repo = CategoryRepository
    
    def get_all_categories(self) -> QuerySet[Category]:
        """Get all active categories."""
        return self.category_repo.get_all_active()
    
    def get_category_by_slug(self, slug: str) -> Optional[Category]:
        """Get a category by its slug."""
        return self.category_repo.get_by_slug(slug)
    
    def get_category_with_products(self, slug: str) -> dict:
        """
        Get a category with its products.
        
        Returns a dict with category and products.
        """
        category = self.category_repo.get_by_slug(slug)
        if not category:
            return {'category': None, 'products': []}
        
        products = ProductRepository.get_by_category(slug)
        return {
            'category': category,
            'products': products
        }


# Singleton instances for convenience
product_service = ProductService()
category_service = CategoryService()
