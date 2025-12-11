# GitHub Actions CI/CD Pipeline

This directory contains the GitHub Actions workflows for the VulnSphere application.

## build-images.yml

Automated build and deployment pipeline for Docker images with multi-architecture support.

### Triggers

- **Push to main/develop**: Builds and pushes images to GitHub Container Registry
- **Pull requests**: Builds images for testing (no push)
- **Manual dispatch**: Allows selective building of API/Frontend images

### Features

- **Multi-architecture builds**: Supports `linux/amd64` and `linux/arm64`
- **Automated testing**: Tests built images in isolated environment
- **Security scanning**: Uses Trivy to scan for vulnerabilities
- **Build caching**: Uses GitHub Actions cache for faster builds
- **Semantic versioning**: Automatic tagging based on branch and commit

### Workflow Steps

1. **Build Images**: 
   - API image from `./api/Dockerfile`
   - Frontend image from `./frontend/Dockerfile`

2. **Test Images**:
   - Spin up test environment with PostgreSQL
   - Test API health endpoints
   - Test authentication
   - Test vulnerability templates
   - Test frontend accessibility

3. **Security Scan**:
   - Scan both images for vulnerabilities
   - Upload results to GitHub Security tab

### Environment Variables

- `REGISTRY`: Set to `ghcr.io` (GitHub Container Registry)
- `IMAGE_NAME_API`: `vulnsphere-api`
- `IMAGE_NAME_FRONTEND`: `vulnsphere-frontend`

### Required Secrets

- `GITHUB_TOKEN`: Automatically provided by GitHub Actions

### Image Tags

- `main` branch: `latest` and `main-{sha}`
- `develop` branch: `develop-{sha}`
- Pull requests: `pr-{pr-number}`

### Usage

#### Manual Build

```bash
# Trigger workflow manually via GitHub UI
# Or use GitHub CLI:
gh workflow run build-images.yml
```

#### Selective Building

When triggering manually, you can choose to build only specific images:
- Build API only: Set `build_api=true`, `build_frontend=false`
- Build Frontend only: Set `build_api=false`, `build_frontend=true`

#### Pull Images

```bash
# Pull latest images
docker pull ghcr.io/your-username/vulnsphere-api:latest
docker pull ghcr.io/your-username/vulnsphere-frontend:latest

# Pull specific version
docker pull ghcr.io/your-username/vulnsphere-api:main-abc123
```

### Local Development

For local development, you can still use the regular Docker Compose setup:

```bash
docker compose up --build -d
```

### Monitoring

- Check the **Actions** tab in your GitHub repository
- Security scan results appear in the **Security** tab
- Image vulnerabilities are tracked and reported

### Troubleshooting

1. **Build failures**: Check the action logs for specific error messages
2. **Test failures**: Verify the test environment setup and dependencies
3. **Security scan failures**: Review the vulnerability reports and update dependencies

### Notes

- Images are only pushed for non-PR events
- Multi-architecture builds may take longer than single-arch builds
- Security scans use the latest Trivy database for accurate results
