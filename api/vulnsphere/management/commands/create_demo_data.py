from django.core.management.base import BaseCommand
from django.utils import timezone
from vulnsphere.models import Company, Project, Vulnerability, User, ReportTemplate, GeneratedReport
from datetime import timedelta
import random

class Command(BaseCommand):
    help = 'Creates demo data for testing purposes'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating demo data...')

        # Ensure we have an admin user
        admin_user = User.objects.filter(role=User.Role.ADMIN).first()
        if not admin_user:
            self.stdout.write(self.style.WARNING('No admin user found. Creating one...'))
            admin_user = User.objects.create_superuser('admin@example.com', 'password', name='Admin User')

        # Create Directory for templates if not exists
        import os
        from django.conf import settings
        from django.core.files.base import ContentFile
        
        # Create HTML Template
        html_content = """
        <html>
        <head><title>{{ project.title }} Report</title></head>
        <body>
            <h1>{{ project.title }}</h1>
            <p><strong>Company:</strong> {{ project.company }}</p>
            <p><strong>Status:</strong> {{ project.status }}</p>
            <hr>
            <h2>Vulnerabilities</h2>
            {% for vuln in vulnerabilities %}
                <h3>{{ vuln.title }} ({{ vuln.severity }})</h3>
                <p>Status: {{ vuln.status }}</p>
                <div>{{ vuln.description }}</div>
                <hr>
            {% endfor %}
        </body>
        </html>
        """
        
        template_html, _ = ReportTemplate.objects.get_or_create(
            name='Standard HTML Report',
            defaults={'description': 'Standard HTML vulnerability report template'}
        )
        if not template_html.file:
            template_html.file.save('standard_template.html', ContentFile(html_content))
            template_html.save()

        # Create DOCX Template (dummy for now, but needs to be a valid zip/docx structure for docxtpl to check)
        # Creating a valid empty docx is complex without a lib. 
        # For demo purposes, we will try to skip docx generation in default run or assume a file exists.
        # But wait, user wants to test. Let's just create a text file for now if they choose HTML?
        # No, docxtpl needs a real docx. 
        # We will focus on HTML since user specifically asked about "package not found at ... professional_report.html"
        
        # NOTE: If we want to support docx demo, we need a valid base docx. 
        # For now, we ensuring HTML works.


        # Create Companies
        companies = []
        for i in range(1, 4):
            company, created = Company.objects.get_or_create(
                slug=f'demo-corp-{i}',
                defaults={
                    'name': f'Demo Corp {i}',
                    'contact_email': f'contact@demo{i}.com',
                    'address': f'123 Demo St, City {i}',
                    'is_active': True
                }
            )
            companies.append(company)
            if created:
                self.stdout.write(f'Created company: {company.name}')

        # Create Projects and Vulnerabilities
        severities = [choice[0] for choice in Vulnerability.Severity.choices]
        statuses = [choice[0] for choice in Vulnerability.Status.choices]

        for company in companies:
            for j in range(1, 3):
                project, created = Project.objects.get_or_create(
                    title=f'{company.name} - Project {j}',
                    company=company,
                    defaults={
                        'engagement_type': 'Web Penetration Test',
                        'start_date': timezone.now().date(),
                        'end_date': timezone.now().date() + timedelta(days=30),
                        'status': Project.Status.IN_REVIEW,
                        'created_by': admin_user
                    }
                )
                if created:
                    self.stdout.write(f'Created project: {project.title}')

                # Create Vulnerabilities
                for k in range(1, 6):
                    vuln, v_created = Vulnerability.objects.get_or_create(
                        title=f'Demo Vulnerability {k} for {project.title}',
                        project=project,
                        defaults={
                            'severity': random.choice(severities),
                            'status': random.choice(statuses),
                            'cvss_base_score': round(random.uniform(1.0, 10.0), 1),
                            'details_md': '## Description\nThis is a demo vulnerability description.\n\n## Impact\nHigh impact.\n\n## Remediation\nFix it.',
                            'created_by': admin_user
                        }
                    )
                
                # Create Report
                GeneratedReport.objects.create(
                    project=project,
                    company=company,
                    template=template_html,
                    format=GeneratedReport.Format.HTML,
                    created_by=admin_user,
                    is_failed=False
                )
        
        self.stdout.write(self.style.SUCCESS('Successfully created demo data'))
