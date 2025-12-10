from django.db.models.signals import post_save, post_migrate
from django.dispatch import receiver
from .models import VulnerabilityAsset, ProjectAsset


@receiver(post_save, sender=VulnerabilityAsset)
def auto_attach_asset_to_project(sender, instance, created, **kwargs):
    """
    Automatically attach assets to projects when a vulnerability references them.
    """
    if created:
        # Create ProjectAsset if it doesn't exist
        ProjectAsset.objects.get_or_create(
            project=instance.vulnerability.project,
            asset=instance.asset,
            defaults={'auto_attached': True}
        )

@receiver(post_migrate)
def create_default_admin(sender, **kwargs):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    if sender.name == 'vulnsphere':
        if not User.objects.filter(role='ADMIN').exists():
            print("Creating default admin user...")
            User.objects.create_superuser(
                email='admin@example.com',
                password='password',
                username='admin',
                name='Default Admin',
                role='ADMIN'
            )
            print("Default admin created: admin@example.com / password")
