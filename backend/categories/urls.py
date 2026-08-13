"""
categories URL stubs — Category endpoints (Iteration 2).
GET            /api/categories/
POST           /api/categories/
PUT/PATCH      /api/categories/<id>/
DELETE         /api/categories/<id>/
"""
from django.urls import path
from .views import CategoryListCreateView, CategoryRetrieveUpdateDestroyView

urlpatterns = [
    path('', CategoryListCreateView.as_view(), name='category-list-create'),
    path('<int:pk>/', CategoryRetrieveUpdateDestroyView.as_view(), name='category-detail'),
]
