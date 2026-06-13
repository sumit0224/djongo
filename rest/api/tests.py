from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Category, Product, Cart, CartItem, Order, OrderItem

User = get_user_model()

class EcommerceAPITests(APITestCase):

    def setUp(self):
        # Create user
        self.user = User.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="testpassword"
        )
        
        # Create category
        self.category = Category.objects.create(name="Electronics")
        
        # Create active products
        self.product1 = Product.objects.create(
            name="Laptop",
            description="High performance laptop",
            price=999.99,
            stock=5,
            category=self.category,
            is_active=True
        )
        self.product2 = Product.objects.create(
            name="Smartphone",
            description="Modern smartphone",
            price=499.99,
            stock=10,
            category=self.category,
            is_active=True
        )
        
        # Create inactive product
        self.inactive_product = Product.objects.create(
            name="Old Phone",
            description="Outdated model",
            price=49.99,
            stock=10,
            category=self.category,
            is_active=False
        )

        # URL names from api/urls.py
        self.add_to_cart_url = reverse("add_to_cart")
        self.get_cart_url = reverse("get_cart")
        self.order_created_url = reverse("order_created")
        self.get_order_url = reverse("get_order")

    def test_unauthenticated_access(self):
        """Verify that all cart and order endpoints require authentication."""
        urls = [
            (self.add_to_cart_url, "post"),
            (self.get_cart_url, "get"),
            (self.order_created_url, "post"),
            (self.get_order_url, "get"),
        ]
        for url, method in urls:
            if method == "post":
                response = self.client.post(url, {})
            else:
                response = self.client.get(url)
            self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_add_to_cart_success(self):
        """Adding active products to the cart successfully."""
        self.client.force_authenticate(user=self.user)
        
        # Add product1 to cart
        data = {"product_id": self.product1.id, "quantity": 2}
        response = self.client.post(self.add_to_cart_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["quantity"], 2)
        self.assertEqual(response.data["product"]["id"], self.product1.id)
        
        # Add product1 to cart again (should increment quantity)
        data = {"product_id": self.product1.id, "quantity": 1}
        response = self.client.post(self.add_to_cart_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["quantity"], 3)

    def test_add_to_cart_validation(self):
        """Check error handling for invalid products, inactive products, and insufficient stock."""
        self.client.force_authenticate(user=self.user)
        
        # Test nonexistent product
        data = {"product_id": 9999, "quantity": 1}
        response = self.client.post(self.add_to_cart_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Test inactive product
        data = {"product_id": self.inactive_product.id, "quantity": 1}
        response = self.client.post(self.add_to_cart_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Test quantity exceeding stock
        data = {"product_id": self.product1.id, "quantity": 6}
        response = self.client.post(self.add_to_cart_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Insufficient stock", response.data["error"])

    def test_get_cart(self):
        """Retrieve cart and check calculations for grand totals and items."""
        self.client.force_authenticate(user=self.user)
        
        # Initially empty cart retrieval
        response = self.client.get(self.get_cart_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["items"]), 0)
        self.assertEqual(float(response.data["cart_total"]), 0.0)

        # Add items to cart
        self.client.post(self.add_to_cart_url, {"product_id": self.product1.id, "quantity": 2})
        self.client.post(self.add_to_cart_url, {"product_id": self.product2.id, "quantity": 1})
        
        # Retrieve cart again
        response = self.client.get(self.get_cart_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["items"]), 2)
        
        # Calculate expected total
        expected_total = (self.product1.price * 2) + (self.product2.price * 1)
        self.assertAlmostEqual(float(response.data["cart_total"]), float(expected_total), places=2)

    def test_update_cart(self):
        """Update cart item quantity and validate limits."""
        self.client.force_authenticate(user=self.user)
        
        # Add item first
        add_res = self.client.post(self.add_to_cart_url, {"product_id": self.product1.id, "quantity": 2})
        item_id = add_res.data["id"]
        
        update_url = reverse("update_cart", kwargs={"item_id": item_id})
        
        # Update quantity successfully
        response = self.client.patch(update_url, {"quantity": 4})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["quantity"], 4)
        
        # Exceed stock limit
        response = self.client.patch(update_url, {"quantity": 10})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Insufficient stock", response.data["error"])
        
        # Try invalid quantity (0 or negative)
        response = self.client.patch(update_url, {"quantity": 0})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        response = self.client.patch(update_url, {"quantity": -5})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_order_created_success(self):
        """Create order from cart, verify stock changes, and check cart clearing."""
        self.client.force_authenticate(user=self.user)
        
        # Add items to cart
        self.client.post(self.add_to_cart_url, {"product_id": self.product1.id, "quantity": 2})
        self.client.post(self.add_to_cart_url, {"product_id": self.product2.id, "quantity": 3})
        
        # Capture initial stocks
        p1_initial_stock = self.product1.stock
        p2_initial_stock = self.product2.stock
        
        # Create order
        response = self.client.post(self.order_created_url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], "pending")
        
        expected_total = (self.product1.price * 2) + (self.product2.price * 3)
        self.assertAlmostEqual(float(response.data["total_amount"]), float(expected_total), places=2)
        self.assertEqual(len(response.data["items"]), 2)
        
        # Verify stock decreased
        self.product1.refresh_from_db()
        self.product2.refresh_from_db()
        self.assertEqual(self.product1.stock, p1_initial_stock - 2)
        self.assertEqual(self.product2.stock, p2_initial_stock - 3)
        
        # Verify cart is cleared
        cart_res = self.client.get(self.get_cart_url)
        self.assertEqual(len(cart_res.data["items"]), 0)

    def test_order_created_empty_cart(self):
        """Verify ordering from an empty cart fails."""
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.order_created_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Cart is empty", response.data["error"])

    def test_get_order(self):
        """Retrieve list of orders for authenticated user."""
        self.client.force_authenticate(user=self.user)
        
        # Add items and create order
        self.client.post(self.add_to_cart_url, {"product_id": self.product1.id, "quantity": 1})
        self.client.post(self.order_created_url)
        
        # Fetch orders
        response = self.client.get(self.get_order_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["items"][0]["product"]["id"], self.product1.id)
