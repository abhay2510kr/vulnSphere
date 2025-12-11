from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """Check if user has Admin role"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'

class IsCompanyMember(permissions.BasePermission):
    """
    Check if user has access to the company.
    - Admins have access to all companies
    - Clients and Testers only have access to companies in their companies field
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Admins have access to everything
        if request.user.role == 'ADMIN':
            return True
        
        return True  # Basic permission check; object-level check in has_object_permission
    
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        # Admins have access to everything
        if request.user.role == 'ADMIN':
            return True
        
        # Get the company from the object
        company = None
        if hasattr(obj, 'company'):
            company = obj.company
        elif hasattr(obj, 'project') and hasattr(obj.project, 'company'):
            company = obj.project.company
        elif obj.__class__.__name__ == 'Company':
            company = obj
        
        # Check if user is assigned to this company
        if company:
            return request.user.companies.filter(pk=company.pk).exists()
        
        return False

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

class IsClientReadOnly(permissions.BasePermission):
    """
    Clients can only read, Testers and Admins can do anything.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Clients can only use safe methods
        if request.user.role == 'CLIENT':
            return request.method in permissions.SAFE_METHODS
        
        # Testers and Admins can do anything
        return True

