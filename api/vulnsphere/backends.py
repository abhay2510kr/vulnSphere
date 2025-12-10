from django.contrib.auth.backends import ModelBackend
from django.db.models import Q
from .models import User

class EmailOrUsernameBackend(ModelBackend):
    """
    Custom authentication backend that allows users to log in with either
    their email address or username.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None or password is None:
            return None
        
        try:
            # Try to find user by username first, then by email
            user = User.objects.get(
                Q(username=username) | Q(email=username)
            )
        except User.DoesNotExist:
            # Run the default password hasher once to reduce the timing
            # difference between an existing and a nonexistent user (#20760).
            User().set_password(password)
            return None
        except User.MultipleObjectsReturned:
            # If somehow we have multiple users, try username first, then email
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                user = User.objects.get(email=username)
        
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
