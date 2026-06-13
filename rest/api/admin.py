from django.contrib import admin

from .models import (
    Product,
    Order,
    Cart,
    CartItem,
    Category,
    Payment,
    OrderItem
)

admin.site.register(Product)
admin.site.register(Category)
admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Payment)