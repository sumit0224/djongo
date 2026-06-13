from django.contrib.auth import authenticate, get_user_model
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Product, Cart, CartItem, Order, OrderItem

from .serializers import (
    RegisterSerializer,
    UserSerializer,
    ProductSerializer,
    CartSerializer,
    CartItemSerializer,
    AddToCartSerializer,
    UpdateCartItemSerializer,
    OrderSerializer
)


# User Register
@api_view(["POST"])
def register(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()
        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


# User Login
@api_view(["POST"])
def login(request):

    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(
        username=username,
        password=password
    )

    if user:
        return Response({
            "message": "Login Successful",
            "user": UserSerializer(user).data
        })

    return Response(
        {"error": "Invalid Credentials"},
        status=status.HTTP_401_UNAUTHORIZED
    )


# Get All Products
@api_view(["GET"])
def get_all_products(request):

    products = Product.objects.all()

    serializer = ProductSerializer(
        products,
        many=True
    )

    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    """
    Accept product_id and quantity from request.data.
    Get or create the user's cart.
    If product already exists in cart, increase quantity.
    Otherwise create a new CartItem.
    Return success response with cart item details.
    """
    serializer = AddToCartSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    product_id = serializer.validated_data["product_id"]
    quantity = serializer.validated_data["quantity"]

    try:
        product = Product.objects.get(id=product_id)
        
        # Get or create the user's cart, using select_related for user optimization
        cart, _ = Cart.objects.select_related("user").get_or_create(user=request.user)

        # Look for existing item for this product in the cart
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart, product=product, defaults={"quantity": 0}
        )

        target_quantity = cart_item.quantity + quantity

        # Verify stock capacity
        if target_quantity > product.stock:
            return Response(
                {"error": f"Insufficient stock. Available stock: {product.stock}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart_item.quantity = target_quantity
        cart_item.save()

        # Serialize and return updated cart item
        response_serializer = CartItemSerializer(cart_item)
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )

    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_cart(request):
    """
    Return all cart items for the logged-in user.
    Include product details, quantity, item total price.
    Include cart grand total.
    Uses serializers.
    """
    try:
        # Get or create the cart with optimized prefetch of items and their associated products
        cart, _ = Cart.objects.select_related("user").prefetch_related("items__product").get_or_create(user=request.user)
        
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_cart(request, item_id):
    """
    Update CartItem quantity.
    Validate quantity > 0.
    Return updated cart item.
    """
    try:
        # Retrieve the cart item. It must belong to the logged-in user's cart.
        cart_item = CartItem.objects.select_related("cart__user", "product").get(id=item_id, cart__user=request.user)
    except CartItem.DoesNotExist:
        return Response({"error": "Cart item not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = UpdateCartItemSerializer(cart_item, data=request.data, partial=True)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    quantity = serializer.validated_data.get("quantity")
    
    # Check if product stock is sufficient
    if quantity > cart_item.product.stock:
        return Response(
            {"error": f"Insufficient stock. Available stock: {cart_item.product.stock}"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        serializer.save()
        response_serializer = CartItemSerializer(cart_item)
        return Response(response_serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def order_created(request):
    """
    Convert all CartItems in the user's cart into an Order.
    Create OrderItems for each, reducing product stock.
    Calculate total_amount automatically.
    Uses transaction.atomic() to ensure database integrity.
    Clear cart after successful order creation.
    Return order details.
    """
    try:
        # Retrieve cart with prefetched items and products
        cart = Cart.objects.select_related("user").prefetch_related("items__product").filter(user=request.user).first()
        
        if not cart or not cart.items.exists():
            return Response({"error": "Cart is empty. Cannot create an order."}, status=status.HTTP_400_BAD_REQUEST)

        # Use atomic transaction to make sure order creation and stock changes are committed together
        with transaction.atomic():
            cart_items = list(cart.items.all())
            total_amount = 0

            # First, validate stock for all items in the cart
            for item in cart_items:
                if item.quantity > item.product.stock:
                    return Response(
                        {"error": f"Insufficient stock for '{item.product.name}'. Available: {item.product.stock}"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            # Create Order
            order = Order.objects.create(
                user=request.user,
                total_amount=0,  # Will update this to the exact sum
                status="pending"
            )

            order_items_to_create = []
            for item in cart_items:
                product = item.product
                
                # Reduce stock
                product.stock -= item.quantity
                product.save()

                # Calculate item price and aggregate total
                price = product.price
                total_amount += price * item.quantity

                order_items_to_create.append(
                    OrderItem(
                        order=order,
                        product=product,
                        quantity=item.quantity,
                        price=price
                    )
                )

            # Bulk create all order items
            OrderItem.objects.bulk_create(order_items_to_create)

            # Update order total amount
            order.total_amount = total_amount
            order.save()

            # Clear the cart items
            cart.items.all().delete()

        # Serialize order details with nested items
        order_serialized = Order.objects.prefetch_related("items__product").get(id=order.id)
        serializer = OrderSerializer(order_serialized)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_order(request):
    """
    Return all orders belonging to the logged-in user.
    Include nested OrderItems.
    Include order status and total amount.
    """
    try:
        # Retrieve all orders for the user, prefetched with nested items and products
        orders = Order.objects.filter(user=request.user).prefetch_related("items__product").order_by("-created_at")
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)