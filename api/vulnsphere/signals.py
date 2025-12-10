from django.db.models.signals import post_save
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
