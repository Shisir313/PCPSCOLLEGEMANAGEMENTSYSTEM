from django.urls import path
from .views import FeatureFlagView

urlpatterns = [
    path('', FeatureFlagView.as_view(), name='feature-flags'),
]
