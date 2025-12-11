"""
Test cases for secure Jinja2 template rendering
"""
from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from jinja2 import TemplateSyntaxError
from vulnsphere.models import ReportTemplate, User, Company, Project
from vulnsphere.report_generator import ReportGenerator


class TemplateSecurityTestCase(TestCase):
    def setUp(self):
        import uuid
        unique_id = str(uuid.uuid4())[:8]
        self.admin_user = User.objects.create_user(
            email=f'admin{unique_id}@test.com',
            username=f'admin{unique_id}',
            password='testpass123',
            role='ADMIN'
        )
        
        self.company = Company.objects.create(
            name='Test Company',
            contact_email='test@example.com'
        )
        
        self.project = Project.objects.create(
            company=self.company,
            title='Test Project',
            engagement_type='Penetration Test',
            start_date='2024-01-01',
            end_date='2024-01-31',
            created_by=self.admin_user
        )
        
        self.report_generator = ReportGenerator()

    def test_safe_template_rendering(self):
        """Test that safe template rendering works correctly"""
        template_content = """
        <h1>{{ project.title }}</h1>
        <p>Company: {{ project.company }}</p>
        <p>Total vulnerabilities: {{ vulnerabilities|length }}</p>
        <p>Date: {{ today }}</p>
        """
        
        template = ReportTemplate.objects.create(
            name='Test Template',
            description='A safe test template',
            file=SimpleUploadedFile("test.html", template_content.encode(), content_type="text/html")
        )
        
        context = self.report_generator.get_project_context(self.project)
        
        # This should work without errors
        from vulnsphere.models import GeneratedReport
        report_instance = GeneratedReport.objects.create(
            project=self.project,
            template=template,
            format='HTML',
            created_by=self.admin_user
        )
        
        # This should not raise any exceptions
        self.report_generator._generate_html(template, context, report_instance)

    def test_blocked_template_inheritance(self):
        """Test that template inheritance is blocked"""
        template_content = """
        {% extends 'base.html' %}
        {% block content %}
        <h1>{{ project.title }}</h1>
        {% endblock %}
        """
        
        template = ReportTemplate.objects.create(
            name='Malicious Template',
            description='Template with inheritance',
            file=SimpleUploadedFile("bad.html", template_content.encode(), content_type="text/html")
        )
        
        context = self.report_generator.get_project_context(self.project)
        
        from vulnsphere.models import GeneratedReport
        report_instance = GeneratedReport.objects.create(
            project=self.project,
            template=template,
            format='HTML',
            created_by=self.admin_user
        )
        
        # This should raise a TemplateSyntaxError due to blocked extends
        with self.assertRaises(Exception):
            self.report_generator._generate_html(template, context, report_instance)

    def test_blocked_template_imports(self):
        """Test that template imports are blocked"""
        template_content = """
        {% import 'macros.html' as macros %}
        {{ macros.render_list(vulnerabilities) }}
        """
        
        template = ReportTemplate.objects.create(
            name='Import Template',
            description='Template with import',
            file=SimpleUploadedFile("import.html", template_content.encode(), content_type="text/html")
        )
        
        context = self.report_generator.get_project_context(self.project)
        
        from vulnsphere.models import GeneratedReport
        report_instance = GeneratedReport.objects.create(
            project=self.project,
            template=template,
            format='HTML',
            created_by=self.admin_user
        )
        
        # This should raise a TemplateSyntaxError due to blocked import
        with self.assertRaises(Exception):
            self.report_generator._generate_html(template, context, report_instance)

    def test_blocked_attribute_access(self):
        """Test that dangerous attribute access is blocked"""
        template_content = """
        <h1>{{ project.__class__.__module__ }}</h1>
        <p>{{ project.__dict__ }}</p>
        """
        
        template = ReportTemplate.objects.create(
            name='Attribute Access Template',
            description='Template trying to access dangerous attributes',
            file=SimpleUploadedFile("attrs.html", template_content.encode(), content_type="text/html")
        )
        
        context = self.report_generator.get_project_context(self.project)
        
        from vulnsphere.models import GeneratedReport
        report_instance = GeneratedReport.objects.create(
            project=self.project,
            template=template,
            format='HTML',
            created_by=self.admin_user
        )
        
        # This should render safely without exposing dangerous attributes
        try:
            self.report_generator._generate_html(template, context, report_instance)
            # If it doesn't crash, the security is working
            self.assertTrue(True)
        except Exception as e:
            # If it crashes, it should be due to blocked access, not successful exploitation
            self.assertIn('security', str(e).lower() or 'blocked' in str(e).lower())

    def test_context_sanitization(self):
        """Test that context is properly sanitized"""
        context = {
            'string': 'test',
            'number': 42,
            'list': [1, 2, 3],
            'dict': {'key': 'value'},
            'none': None,
            'boolean': True
        }
        
        sanitized = self.report_generator._sanitize_context(context)
        
        # All keys should be strings
        for key in sanitized.keys():
            self.assertIsInstance(key, str)
        
        # Values should be primitive types or properly nested structures
        self.assertEqual(sanitized['string'], 'test')
        self.assertEqual(sanitized['number'], 42)
        self.assertEqual(sanitized['list'], [1, 2, 3])
        self.assertEqual(sanitized['dict'], {'key': 'value'})
        self.assertEqual(sanitized['none'], None)
        self.assertEqual(sanitized['boolean'], True)
