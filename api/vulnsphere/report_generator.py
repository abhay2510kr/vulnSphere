import os
from django.conf import settings
from django.core.files.base import ContentFile
from docxtpl import DocxTemplate
from io import BytesIO
from .models import GeneratedReport, Project, Company

class ReportGenerator:
    def generate_report(self, template, context, output_format, generated_report_instance):
        try:
            if output_format == GeneratedReport.Format.DOCX:
                self._generate_docx(template, context, generated_report_instance)
            elif output_format == GeneratedReport.Format.HTML:
                # Placeholder for HTML generation if needed later
                pass
            
        except Exception as e:
            generated_report_instance.is_failed = True
            generated_report_instance.error_message = str(e)
            generated_report_instance.save()
            raise e

    def _generate_docx(self, template, context, generated_report_instance):
        doc = DocxTemplate(template.file.path)
        doc.render(context)
        
        # Save to buffer
        buffer = BytesIO()
        doc.save(buffer)
        buffer.seek(0)
        
        # Save to FileField
        filename = f"report_{generated_report_instance.id}.docx"
        generated_report_instance.file.save(filename, ContentFile(buffer.read()))
        generated_report_instance.save()

    def _generate_html(self, template, context, report_instance):
        """Generate HTML report using Jinja2 template"""
        try:
            # Read the template file
            template_content = template.file.read().decode('utf-8')
            
            # Create Jinja2 template
            from jinja2 import Template
            jinja_template = Template(template_content)
            
            # Add today's date to context
            from datetime import date
            context['today'] = date.today().strftime('%B %d, %Y')
            
            # Render the template
            html_output = jinja_template.render(context)
            
            # Save the output
            output_filename = f'report_{report_instance.id}.html'
            report_instance.file.save(output_filename, ContentFile(html_output.encode('utf-8')))
            
        except Exception as e:
            raise Exception(f"Error generating HTML report: {str(e)}")
    
    def get_project_context(self, project):
        """Get comprehensive project context for report generation"""
        from .serializers import VulnerabilitySerializer
        
        vulnerabilities = project.vulnerabilities.all().order_by('-severity', '-created_at')
        
        context = {
            'project': {
                'id': str(project.id),
                'title': project.title,
                'company': project.company.name,
                'engagement_type': project.engagement_type,
                'summary': project.summary,
                'scope_description': project.scope_description,
                'start_date': project.start_date.strftime('%B %d, %Y'),
                'end_date': project.end_date.strftime('%B %d, %Y'),
                'status': project.get_status_display(),
            },
            'vulnerabilities': []
        }
        
        for vuln in vulnerabilities:
            # Parse markdown details for better template rendering
            vuln_data = {
                'id': str(vuln.id),
                'title': vuln.title,
                'severity': vuln.get_severity_display(),
                'status': vuln.get_status_display(),
                'cvss_base_score': str(vuln.cvss_base_score) if vuln.cvss_base_score else 'N/A',
                'cvss_vector': vuln.cvss_vector,
                'description': vuln.details_md,  # Full markdown content
                'created_at': vuln.created_at.strftime('%B %d, %Y'),
            }
            context['vulnerabilities'].append(vuln_data)
        
        return context
    
    def get_company_context(self, company):
        """Get comprehensive company context for report generation"""
        projects = company.projects.all().order_by('-created_at')
        
        context = {
            'company': {
                'id': str(company.id),
                'name': company.name,
                'contact_email': company.contact_email,
                'address': company.address,
                'notes': company.notes,
            },
            'projects': []
        }
        
        for project in projects:
            context['projects'].append({
                'id': str(project.id),
                'title': project.title,
                'engagement_type': project.engagement_type,
                'start_date': project.start_date.strftime('%B %d, %Y'),
                'end_date': project.end_date.strftime('%B %d, %Y'),
                'status': project.get_status_display(),
                'vulnerability_count': project.vulnerabilities.count(),
            })
        
        return context
