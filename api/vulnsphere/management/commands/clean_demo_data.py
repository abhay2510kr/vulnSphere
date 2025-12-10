from django.core.management.base import BaseCommand
from vulnsphere.models import Company, Project, Vulnerability, GeneratedReport

class Command(BaseCommand):
    help = 'Cleans up demo data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Cleaning demo data...')

        # Delete companies that start with 'Demo Corp'
        # This will cascade delete projects, vulns, reports etc.
        deleted_count, _ = Company.objects.filter(name__startswith='Demo Corp').delete()
        
        self.stdout.write(self.style.SUCCESS(f'Successfully deleted {deleted_count} items (companies and cascading objects)'))
