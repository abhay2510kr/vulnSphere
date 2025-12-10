from django.core.management.base import BaseCommand
from vulnsphere.models import User

class Command(BaseCommand):
    help = 'Creates a default admin user with username "admin" and password "password"'

    def handle(self, *args, **options):
        # Check if admin user already exists
        if User.objects.filter(username='admin').exists():
            self.stdout.write(self.style.WARNING('Admin user already exists'))
            return

        # Create admin user
        admin = User.objects.create_user(
            email='admin@vulnsphere.local',
            username='admin',
            name='Administrator',
            password='password',
            role='ADMIN',
            is_staff=True,
            is_superuser=True
        )
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created admin user:'))
        self.stdout.write(f'  Username: admin')
        self.stdout.write(f'  Email: admin@vulnsphere.local')
        self.stdout.write(f'  Password: password')
        self.stdout.write(f'  Role: ADMIN')
        self.stdout.write(self.style.WARNING('\\nIMPORTANT: Change the password after first login!'))
