from django.apps import AppConfig


class VulnSphereConfig(AppConfig):
    name = 'vulnsphere'
    
    def ready(self):
        import vulnsphere.signals  # noqa
