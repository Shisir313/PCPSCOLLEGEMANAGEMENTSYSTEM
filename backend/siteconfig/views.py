from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from .models import FeatureFlag
from .serializers import FeatureFlagSerializer


class FeatureFlagView(APIView):
    def get_permissions(self):
        # Public read; admin-only updates
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get(self, request):
        flags = FeatureFlag.get_solo()
        return Response(FeatureFlagSerializer(flags).data)

    def post(self, request):
        # allow admins to update flags
        flags = FeatureFlag.get_solo()
        serializer = FeatureFlagSerializer(flags, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
