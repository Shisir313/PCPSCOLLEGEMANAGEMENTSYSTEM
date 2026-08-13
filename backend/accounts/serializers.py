from rest_framework import serializers

from .models import CustomUser


class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, required=True, min_length=8)
    password2 = serializers.CharField(write_only=True, required=True, label='Confirm password')
    email = serializers.EmailField(required=False)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Toggle email requirement via settings flag
        from django.conf import settings
        if getattr(settings, 'REQUIRE_EMAIL_ON_REGISTRATION', True):
            self.fields['email'].required = True
        else:
            self.fields['email'].required = False

    class Meta:
        model  = CustomUser
        fields = ['id', 'username', 'email', 'password', 'password2', 'role']
        extra_kwargs = {
            # New registrations start as 'pending' and require admin approval.
            'role': {'default': 'pending'},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        # New users should be created with role 'pending' for admin approval.
        validated_data.pop('password2')
        password = validated_data.pop('password')
        validated_data['role'] = 'pending'
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = CustomUser
        fields = ['id', 'username', 'email', 'role', 'is_active', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class PromoteUserSerializer(serializers.Serializer):
    user_id = serializers.IntegerField(write_only=True)
    role = serializers.ChoiceField(choices=[('organizer', 'Organizer'), ('attendee', 'Attendee')], write_only=True)

    def validate_user_id(self, value):
        try:
            CustomUser.objects.get(id=value)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError('User not found.')
        return value
