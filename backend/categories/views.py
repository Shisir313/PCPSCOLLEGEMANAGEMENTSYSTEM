from rest_framework import generics, permissions

from .models import Category
from .serializers import CategorySerializer
from accounts.permissions import IsAdmin


class CategoryListCreateView(generics.ListCreateAPIView):
    """GET /api/categories/  — public
    POST /api/categories/ — admin only
    """
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsAdmin()]
        return [permissions.AllowAny()]


class CategoryRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """GET /api/categories/<id>/ — public
    PUT/PATCH/DELETE — admin only
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method in ('PUT', 'PATCH', 'DELETE'):
            return [permissions.IsAuthenticated(), IsAdmin()]
        return [permissions.AllowAny()]
