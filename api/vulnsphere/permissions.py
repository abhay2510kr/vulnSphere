from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """Check if user has Admin role"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'

class IsAdminOrTester(permissions.BasePermission):
    """Allows Admins and Testers full access, Clients read-only"""
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Admins and Testers can do anything
        if request.user.role in ['ADMIN', 'TESTER']:
            return True
        
        # Clients can only read
        return request.method in permissions.SAFE_METHODS

class IsTesterOrAdmin(permissions.BasePermission):
    """
    Allows write access only to Testers and Admins.
    Clients have read-only access.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Read permissions for everyone
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for Admins and Testers
        return request.user.role in ['ADMIN', 'TESTER']

class CanRequestRetest(permissions.BasePermission):
    """
    Allows all authenticated users to request retests.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated

