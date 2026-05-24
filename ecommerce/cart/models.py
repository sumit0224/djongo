from django.db import models


class Cart(models.Model):

    user_id = models.IntegerField()

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):

        return f"Cart {self.user_id}"



class CartItem(models.Model):

    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name='items'
    )

    product_id = models.IntegerField()

    quantity = models.IntegerField(default=1)

    added_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):

        return f"Product {self.product_id}"