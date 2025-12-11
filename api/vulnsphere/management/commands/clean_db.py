from django.core.management.base import BaseCommand
from django.db import connection
from vulnsphere.models import (
    User, Company, Asset, Project, Vulnerability, 
    VulnerabilityAsset, ProjectAsset, Retest, Comment, 
    Attachment, ActivityLog, ReportTemplate, 
    VulnerabilityTemplate, GeneratedReport
)

class Command(BaseCommand):
    help = 'Clean all data from the database while preserving structure'

    def handle(self, *args, **options):
        self.stdout.write('Starting database cleanup...')
        
        # Delete in order of dependency to avoid foreign key constraints
        models_to_delete = [
            GeneratedReport,
            Retest,
            Comment,
            Attachment,
            VulnerabilityAsset,
            ProjectAsset,
            Vulnerability,
            Project,
            Asset,
            VulnerabilityTemplate,
            ReportTemplate,
            ActivityLog,
            User,
            Company,
        ]
        
        total_deleted = 0
        for model in models_to_delete:
            count = model.objects.count()
            if count > 0:
                model.objects.all().delete()
                self.stdout.write(f'Deleted {count} records from {model.__name__}')
                total_deleted += count
            else:
                self.stdout.write(f'No records found in {model.__name__}')
        
        # Reset sequences
        if connection.vendor == 'postgresql':
            with connection.cursor() as cursor:
                cursor.execute("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")
                tables = cursor.fetchall()
                for table in tables:
                    table_name = table[0]
                    cursor.execute(f"ALTER SEQUENCE {table_name}_id_seq RESTART WITH 1")
                    self.stdout.write(f'Reset sequence for {table_name}')
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully cleaned database! Total records deleted: {total_deleted}')
        )
