# GitHub Agent Troubleshooting Guide

## Common Issues

### 401 Authentication Errors

**Symptoms:**
- All API calls return `401 Bad credentials`
- Error message: "Requires authentication"

**Cause:**
The GitHub Personal Access Token in `.env` is either:
- Expired or revoked
- Deleted from GitHub
- Has incorrect format
- Lacks required permissions

**Solution:**

1. **Generate a New Token:**
   - Go to https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Or use fine-grained tokens: "Generate new token" → "Generate new token (fine-grained)"

2. **Select Required Scopes (Classic Tokens):**
   - ✅ `repo` - Full control of private repositories
   - ✅ `workflow` - Update GitHub Action workflows
   - Optional: `admin:repo_hook` - Full control of repository hooks

3. **For Fine-Grained Tokens:**
   - Select the repository: `Parlay-Kei/datasolutions`
   - Grant permissions:
     - Repository permissions:
       - ✅ Contents: Read
       - ✅ Metadata: Read
       - ✅ Actions: Read
       - ✅ Secrets: Read
     - Account permissions:
       - ✅ None required

4. **Update .env File:**
   ```env
   GITHUB_TOKEN=ghp_your_new_token_here
   GITHUB_OWNER=Parlay-Kei
   GITHUB_REPO=datasolutions
   ```

5. **Test the Token:**
   ```bash
   cd agents/github-ops
   node test-token.js
   ```

### 403 Forbidden Errors

**Symptoms:**
- Some operations work, others return `403 Forbidden`
- Specific permissions are denied

**Cause:**
Token lacks specific permissions for the operation.

**Solution:**
- For classic tokens: Regenerate with additional scopes
- For fine-grained tokens: Add the missing permission in token settings

### Repository Not Found (404)

**Symptoms:**
- Error: "Not Found" when accessing repository

**Cause:**
- Repository name or owner is incorrect
- Repository is private and token lacks access
- Repository doesn't exist

**Solution:**
1. Verify repository exists: https://github.com/Parlay-Kei/datasolutions
2. Check `.env` has correct values:
   ```env
   GITHUB_OWNER=Parlay-Kei
   GITHUB_REPO=datasolutions
   ```
3. Ensure token has access to the repository

## Testing Your Configuration

### Quick Test
```bash
cd agents/github-ops
node test-token.js
```

### Run Diagnostic
```bash
npm run diagnose
```

### Test Specific Function
```bash
# Test workflows
npm run cli -- workflows list

# Test secrets
npm run cli -- secrets list

# Test repository
npm run cli -- repo status
```

## Token Best Practices

1. **Use Fine-Grained Tokens** (recommended):
   - More secure (repository-specific)
   - Better permission control
   - Can set expiration dates

2. **Set Expiration Dates:**
   - Fine-grained tokens: Set expiration (30-90 days)
   - Classic tokens: Set expiration when creating

3. **Rotate Tokens Regularly:**
   - Update tokens every 60-90 days
   - Update `.env` file immediately

4. **Never Commit Tokens:**
   - `.env` should be in `.gitignore`
   - Use environment variables in CI/CD

## Getting Help

If issues persist:
1. Run `node test-token.js` for detailed diagnostics
2. Check GitHub token settings: https://github.com/settings/tokens
3. Verify repository access: https://github.com/Parlay-Kei/datasolutions
4. Review agent logs for specific error messages
