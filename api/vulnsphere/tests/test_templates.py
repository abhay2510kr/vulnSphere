from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from vulnsphere.models import User, VulnerabilityTemplate

class VulnerabilityTemplateTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        # Create users
        cls.admin = User.objects.create_user(username='admin_test', email='admin_test@example.com', password='testpassword', role='ADMIN')
        cls.tester = User.objects.create_user(username='tester_test', email='tester_test@example.com', password='testpassword', role='TESTER')
        cls.client_user = User.objects.create_user(username='client_test', email='client_test@example.com', password='testpassword', role='CLIENT')

        # Create initial template
        cls.template = VulnerabilityTemplate.objects.create(
            title='Test Template',
            severity='HIGH',
            details_md='### Details',
            created_by=cls.admin
        )

        cls.url = '/api/v1/vulnerability-templates/'

    def test_list_templates(self):
        self.client.force_authenticate(user=self.tester)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_create_template_admin(self):
        self.client.force_authenticate(user=self.admin)
        data = {
            'title': 'New Template',
            'severity': 'MEDIUM',
            'details_md': 'Markdown details',
            'references': ['http://example.com']
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(VulnerabilityTemplate.objects.count(), 2)

    def test_create_template_client_denied(self):
        self.client.force_authenticate(user=self.client_user)
        data = {
            'title': 'Client Template',
            'severity': 'LOW',
            'details_md': 'Details'
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_template(self):
        self.client.force_authenticate(user=self.tester)
        data = {'title': 'Updated Title'}
        response = self.client.patch(f'{self.url}{self.template.id}/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.template.refresh_from_db()
        self.assertEqual(self.template.title, 'Updated Title')

    def test_delete_template(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.delete(f'{self.url}{self.template.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(VulnerabilityTemplate.objects.count(), 0)
