from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib. auth import authenticate, get_user_model
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
from . serializers import (
    UserSerializer, 
    RegisterSerializer, 
    GoogleAuthSerializer,
    SocialAuthSerializer
)

User = get_user_model()


def get_tokens_for_user(user):
    """Generate JWT tokens for a user"""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh. access_token),
    }


# === Traditional Email/Password Auth ===

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register with email and password"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': tokens,
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Login with email and password"""
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password: 
        return Response(
            {'error': 'Email and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Django's authenticate expects username, but we use email
    user = authenticate(request, username=email, password=password)
    
    if user: 
        tokens = get_tokens_for_user(user)
        return Response({
            'user':  UserSerializer(user).data,
            'tokens': tokens,
        })
    
    return Response(
        {'error': 'Invalid credentials'},
        status=status. HTTP_401_UNAUTHORIZED
    )


# === Google OAuth Auth ===

@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    """
    Authenticate with Google ID token
    This is for direct Google Sign-In (if you use Google SDK in frontend)
    """
    serializer = GoogleAuthSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    id_token_str = serializer.validated_data['id_token']
    
    try:
        # Verify the token with Google
        idinfo = id_token.verify_oauth2_token(
            id_token_str,
            requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )
        
        # Extract user info
        email = idinfo['email']
        provider_id = idinfo['sub']
        name = idinfo.get('name', '')
        avatar = idinfo. get('picture', '')
        
        # Get or create user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email,
                'provider':  'google',
                'provider_id': provider_id,
                'first_name': name. split()[0] if name else '',
                'last_name': ' '.join(name.split()[1:]) if len(name.split()) > 1 else '',
                'avatar': avatar,
                'is_email_verified': True,  # Google verifies emails
            }
        )
        
        # Update provider info if user already exists
        if not created and not user.provider:
            user.provider = 'google'
            user.provider_id = provider_id
            user.save()
        
        tokens = get_tokens_for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': tokens,
            'is_new_user': created,
        })
        
    except ValueError as e:
        return Response(
            {'error': 'Invalid Google token', 'detail': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def social_auth(request):
    """
    Alternative:  Accept pre-validated social auth data from NextAuth/Firebase
    Use this if NextAuth handles OAuth and sends you the user data
    """
    serializer = SocialAuthSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    email = data['email']
    provider = data['provider']
    provider_id = data['provider_id']
    name = data.get('name', '')
    avatar = data.get('avatar', '')
    
    # Get or create user
    user, created = User. objects.get_or_create(
        email=email,
        defaults={
            'username': email,
            'provider': provider,
            'provider_id': provider_id,
            'first_name': name.split()[0] if name else '',
            'last_name': ' '.join(name.split()[1:]) if len(name.split()) > 1 else '',
            'avatar':  avatar,
            'is_email_verified': True,
        }
    )
    
    # Update provider info if needed
    if not created and not user.provider:
        user.provider = provider
        user.provider_id = provider_id
        if avatar:
            user.avatar = avatar
        user.save()
    
    tokens = get_tokens_for_user(user)
    
    return Response({
        'user': UserSerializer(user).data,
        'tokens': tokens,
        'is_new_user': created,
    })


# === Protected Routes ===

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    """Get current user profile"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update user profile"""
    user = request.user
    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    Logout (optional - with JWT you typically just delete token client-side)
    But you can blacklist the token if using simplejwt blacklist
    """
    try: 
        refresh_token = request.data.get('refresh')
        if refresh_token: 
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({'message': 'Logged out successfully'})
    except Exception as e:
        return Response(
            {'error': 'Invalid token'},
            status=status.HTTP_400_BAD_REQUEST
        )