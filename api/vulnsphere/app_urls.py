from django.urls import path, include
from rest_framework_nested import routers
from .views import (
    UserViewSet, CompanyViewSet,
    AssetViewSet, ProjectViewSet, VulnerabilityViewSet, VulnerabilityAssetViewSet, RetestViewSet, 
    CommentViewSet, AttachmentViewSet, ActivityLogViewSet, ProjectAssetViewSet, DashboardStatsViewSet,
    ReportTemplateViewSet, GeneratedReportViewSet, VulnerabilityTemplateViewSet
)

router = routers.DefaultRouter()
# User management
router.register(r'users', UserViewSet)
# Global endpoints
router.register(r'comments', CommentViewSet)
# Dashboard stats
router.register(r'dashboard', DashboardStatsViewSet, basename='dashboard')

# Global vulnerabilities endpoint
router.register(r'vulnerabilities', VulnerabilityViewSet, basename='vulnerabilities')

# Companies router
router.register(r'companies', CompanyViewSet)

companies_router = routers.NestedDefaultRouter(router, r'companies', lookup='company')
companies_router.register(r'assets', AssetViewSet, basename='company-assets')
companies_router.register(r'projects', ProjectViewSet, basename='company-projects')
companies_router.register(r'activity', ActivityLogViewSet, basename='company-activity')

# Projects router (nested under companies)
projects_router = routers.NestedDefaultRouter(companies_router, r'projects', lookup='project')
projects_router.register(r'vulnerabilities', VulnerabilityViewSet, basename='project-vulnerabilities')
projects_router.register(r'assets', ProjectAssetViewSet, basename='project-assets')
# projects/{id}/attachments
projects_router.register(r'attachments', AttachmentViewSet, basename='project-attachments')

# Vulnerabilities router (nested under projects, which is nested under companies)
vulns_router = routers.NestedDefaultRouter(projects_router, r'vulnerabilities', lookup='vulnerability')
vulns_router.register(r'assets', VulnerabilityAssetViewSet, basename='vulnerability-assets')
vulns_router.register(r'retests', RetestViewSet, basename='vulnerability-retests')
vulns_router.register(r'attachments', AttachmentViewSet, basename='vulnerability-attachments')

# Add standalone projects router for direct project access
router.register(r'projects', ProjectViewSet, basename='projects')

# Add global activity logs endpoint (admin only)
router.register(r'activity-logs', ActivityLogViewSet, basename='activity-logs')

# Reports
router.register(r'report-templates', ReportTemplateViewSet)
router.register(r'generated-reports', GeneratedReportViewSet)
router.register(r'vulnerability-templates', VulnerabilityTemplateViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('', include(companies_router.urls)),
    path('', include(projects_router.urls)),
    path('', include(vulns_router.urls)),
]
