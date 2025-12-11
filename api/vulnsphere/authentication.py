from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import serializers

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'username'  # Keep as 'username' for compatibility

    def validate(self, attrs):
        # Accept both 'username' and 'login' fields
        username = attrs.get('username') or attrs.get('login')
        password = attrs.get('password')

        if not username or not password:
            raise serializers.ValidationError(
                'Must include "username" and "password".'
            )

        # Use default authentication (which will use our custom backend)
        # The backend will handle both email and username lookup
        data = {
            'username': username,  # Pass to default auth
            'password': password
        }

        return super().validate(data)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
