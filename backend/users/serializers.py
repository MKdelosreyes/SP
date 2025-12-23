from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserSerializer(serializers. ModelSerializer):
    """Basic user serializer"""
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 
            'avatar', 'provider', 'created_at'
        ]
        read_only_fields = ['id', 'provider', 'created_at']


class RegisterSerializer(serializers.ModelSerializer):
    """Traditional email/password registration"""
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta: 
        model = User
        fields = ['email', 'password', 'password2', 'first_name', 'last_name']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers. ValidationError({
                "password": "Password fields didn't match."
            })
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['email'],  # Use email as username
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        return user


class GoogleAuthSerializer(serializers.Serializer):
    """Google OAuth authentication"""
    id_token = serializers.CharField(required=True)
    
    def validate_id_token(self, value):
        """Validate Google ID token - we'll implement this in the view"""
        return value


class SocialAuthSerializer(serializers. Serializer):
    """
    Alternative:  Direct social auth data from NextAuth/Firebase
    Use this if NextAuth handles OAuth and sends user data
    """
    provider = serializers.CharField(required=True)
    provider_id = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    name = serializers.CharField(required=False, allow_blank=True)
    avatar = serializers.URLField(required=False, allow_blank=True)