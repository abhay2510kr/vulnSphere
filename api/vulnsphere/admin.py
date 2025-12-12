from django.contrib import admin
from .models import (
    User, Company, Asset, Project, 
    Vulnerability, VulnerabilityAsset, Retest, 
    Comment, Attachment, ActivityLog, ProjectAsset,
    ReportTemplate, VulnerabilityTemplate, GeneratedReport
)

# Register your models here.
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'username', 'name', 'role', 'is_active')
    list_filter = ('role', 'is_active')
    search_fields = ('email', 'username', 'name')

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'contact_email', 'is_active', 'created_at')
    search_fields = ('name', 'contact_email')
    list_filter = ('is_active', 'created_at')

# CompanyMembership admin removed - users now have global roles

@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ('name', 'company', 'type', 'identifier', 'is_active')
    list_filter = ('type', 'is_active', 'company')
    search_fields = ('name', 'identifier')

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'engagement_type', 'status', 'start_date', 'end_date')
    list_filter = ('status', 'company')
    search_fields = ('title', 'company__name')

@admin.register(Vulnerability)
class VulnerabilityAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'severity', 'status', 'created_at')
    list_filter = ('severity', 'status', 'project__company')
    search_fields = ('title', 'project__title')

@admin.register(VulnerabilityAsset)
class VulnerabilityAssetAdmin(admin.ModelAdmin):
    list_display = ('vulnerability', 'asset')
    search_fields = ('vulnerability__title', 'asset__name')

@admin.register(ProjectAsset)
class ProjectAssetAdmin(admin.ModelAdmin):
    list_display = ('project', 'asset', 'auto_attached', 'attached_at')
    list_filter = ('auto_attached',)
    search_fields = ('project__title', 'asset__name')

@admin.register(Retest)
class RetestAdmin(admin.ModelAdmin):
    list_display = ('vulnerability', 'request_type', 'status', 'retest_date', 'performed_by', 'requested_by')
    list_filter = ('request_type', 'status', 'retest_date')

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('author', 'company', 'is_internal', 'created_at')
    list_filter = ('is_internal', 'company', 'created_at')

@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'uploaded_by', 'uploaded_at', 'project', 'vulnerability')
    list_filter = ('uploaded_at',)

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'entity_type', 'company', 'created_at')
    list_filter = ('action', 'entity_type', 'company')
    search_fields = ('user__email', 'company__name')

@admin.register(ReportTemplate)
class ReportTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at', 'updated_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'description')
    readonly_fields = ('id', 'created_at', 'updated_at')

@admin.register(VulnerabilityTemplate)
class VulnerabilityTemplateAdmin(admin.ModelAdmin):
    list_display = ('title', 'severity', 'cvss_base_score', 'created_by', 'created_at', 'updated_at')
    list_filter = ('severity', 'created_at')
    search_fields = ('title', 'details_md')
    readonly_fields = ('id', 'created_at', 'updated_at')

@admin.register(GeneratedReport)
class GeneratedReportAdmin(admin.ModelAdmin):
    list_display = ('id', 'project', 'template', 'format', 'is_failed', 'created_by', 'created_at')
    list_filter = ('format', 'is_failed', 'created_at', 'project__company')
    search_fields = ('project__title', 'template__name')
    readonly_fields = ('id', 'created_at')
