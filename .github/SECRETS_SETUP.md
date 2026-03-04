# GitHub Actions Secrets Setup

## Required Secrets

Configure these secrets in your GitHub repository:
**Settings → Secrets and variables → Actions → New repository secret**

### Docker Hub (Optional - for automated deployments)
```
DOCKER_USERNAME=your_dockerhub_username
DOCKER_PASSWORD=your_dockerhub_password_or_token
```

### Deployment (Optional - for automated deployments)
```
DEPLOY_HOST=your.server.ip.address
DEPLOY_USER=deployment_user
DEPLOY_KEY=<paste your SSH private key>
```

### Code Coverage (Optional)
```
CODECOV_TOKEN=your_codecov_token
```

## How to Generate SSH Key for Deployment

```bash
# On your local machine
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy

# Copy public key to server
ssh-copy-id -i ~/.ssh/github_deploy.pub user@your.server.ip

# Copy private key content for GitHub secret
cat ~/.ssh/github_deploy
# Copy the entire output including BEGIN and END lines
```

## How to Get Docker Hub Token

1. Go to https://hub.docker.com/settings/security
2. Click "New Access Token"
3. Name it "GitHub Actions"
4. Copy the token (you won't see it again)
5. Use this as DOCKER_PASSWORD secret

## Testing CI/CD Pipeline

After setting up secrets:

```bash
# Push to trigger CI
git add .
git commit -m "test: trigger CI pipeline"
git push origin main
```

Check the Actions tab in GitHub to see the pipeline run.

## Troubleshooting

### Pipeline fails on Docker login
- Verify DOCKER_USERNAME and DOCKER_PASSWORD are correct
- Check if Docker Hub account is active
- Ensure token has write permissions

### Deployment fails
- Verify SSH key is correct (no extra spaces/newlines)
- Check DEPLOY_HOST is accessible from GitHub Actions
- Verify DEPLOY_USER has proper permissions
- Test SSH connection manually

### Tests fail
- Check if all environment variables are set
- Verify database migrations are up to date
- Review test logs in Actions tab
