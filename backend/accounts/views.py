from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken

from .permissions import IsAdmin
from .serializers import RegisterSerializer, UserSerializer
from .serializers import PromoteUserSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ — public endpoint, creates a new user."""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class UserListView(generics.ListAPIView):
    """GET /api/users/ — public read; admin-only writes (no writes exposed here)."""
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer

    def get_permissions(self):
        # Public read
        return [permissions.AllowAny()]


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    PATCH /api/users/<id>/ — Admin only, update user role.
    DELETE /api/users/<id>/ — Admin only, deactivate user account.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    def get_permissions(self):
        # Allow public GET; restrict edits/deletes to admin
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsAdmin()]
    http_method_names = ['get', 'patch', 'delete', 'head', 'options']

    def perform_destroy(self, instance):
        # Deactivate instead of delete; blacklist all outstanding tokens
        instance.is_active = False
        instance.save()
        # Blacklist all outstanding refresh tokens for this user
        outstanding_tokens = OutstandingToken.objects.filter(user=instance)
        for token in outstanding_tokens:
            BlacklistedToken.objects.get_or_create(token=token)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Prevent admin from deactivating their own account
        if instance == request.user:
            return Response(
                {'detail': 'You cannot deactivate your own account.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    """GET /api/auth/me/ — return the authenticated user's profile."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class PromoteUserView(APIView):
    """POST /api/admin/promote-user/ — admin-only endpoint to change a user's role."""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def post(self, request):
        serializer = PromoteUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_id = serializer.validated_data['user_id']
        role = serializer.validated_data['role']
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        user.role = role
        user.save()
        return Response(UserSerializer(user).data)
