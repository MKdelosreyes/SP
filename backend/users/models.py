from django. contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """
    Custom user model that supports both email/password and social auth
    """
    # Override username to allow email-based auth
    username = models.CharField(max_length=150, unique=True, blank=True, null=True)
    email = models.EmailField(unique=True, db_index=True)
    
    # Social auth fields
    provider = models.CharField(
        max_length=50, 
        blank=True, 
        null=True,
        help_text="OAuth provider (google, facebook, etc.)"
    )
    provider_id = models.CharField(
        max_length=255, 
        blank=True, 
        null=True,
        help_text="Unique ID from OAuth provider"
    )
    
    # Profile fields
    avatar = models.URLField(blank=True, null=True)
    is_email_verified = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models. DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Use email as the primary identifier
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']  # Required for createsuperuser
    
    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['provider', 'provider_id']),
        ]
    
    def __str__(self):
        return self.email
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.email