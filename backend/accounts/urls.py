from django.urls import path
from .views import RegisterView, MeView, PromoteUserView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', MeView.as_view(), name='me'),
    path('admin/promote-user/', PromoteUserView.as_view(), name='promote-user'),
]
