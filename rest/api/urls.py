from django.urls import path
from . import views

urlpatterns = [
    # Auth endpoints
    path("register/", views.register, name="register"),
    path("login/", views.login, name="login"),
    
    # Products endpoints
    path("products/", views.get_all_products, name="products"),
    
    # Cart endpoints
    path("cart/", views.get_cart, name="get_cart"),
    path("cart/add/", views.add_to_cart, name="add_to_cart"),
    path("cart/item/<int:item_id>/", views.update_cart, name="update_cart"),
    
    # Order endpoints
    path("order/create/", views.order_created, name="order_created"),
    path("orders/", views.get_order, name="get_order"),
]