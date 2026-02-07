# User Guide: Automated Code Review Bot

## Overview
The Automated Code Review Bot helps improve code quality by automatically reviewing pull requests and providing feedback on common issues, style violations, and security concerns.

## Getting Started

### For Developers

#### 1. Enable for Your Repository
Contact the Platform Engineering team to enable the bot for your repository:
- Email: platform-eng@company.com
- Slack: #platform-engineering
- Required info: Repository name, team contact

#### 2. Understanding Bot Comments
The bot will post comments on your PRs with:
- **Style Issues**: Code formatting and conventions
- **Security Concerns**: Potential security vulnerabilities
- **Best Practices**: Recommendations for code improvement
- **Test Coverage**: Missing test coverage areas

#### 3. Responding to Feedback
- Fix issues marked as "Required" before merging
- Address "Recommended" items when possible
- Use `@codebot ignore` to suppress false positives (requires justification)

### Configuration

#### Repository Settings
Configure via `.codebot.json` in your repository root:

```json
{
  "rules": {
    "style": {
      "enabled": true,
      "severity": "warning"
    },
    "security": {
      "enabled": true,
      "severity": "error"
    },
    "coverage": {
      "enabled": true,
      "threshold": 80
    }
  },
  "ignore": [
    "test/**/*.js",
    "docs/**/*"
  ],
  "notifications": {
    "slack": {
      "channel": "#dev-team",
      "mentions": ["@tech-lead"]
    }
  }
}
```

#### Rule Categories

1. **Style Rules**
   - ESLint configuration compliance
   - Naming conventions
   - Code formatting

2. **Security Rules**
   - Dependency vulnerability scanning
   - Hardcoded secrets detection
   - Input validation checks

3. **Quality Rules**
   - Test coverage requirements
   - Code complexity analysis
   - Documentation completeness

### Team Management

#### For Tech Leads

##### Dashboard Access
Access the management dashboard at: https://codebot.internal.company.com

Features:
- Repository configuration
- Team statistics
- Rule customization
- Exception management

##### Adding Team Members
1. Navigate to Team Settings
2. Add GitHub usernames
3. Assign roles (Reviewer, Admin)
4. Set notification preferences

##### Custom Rules
Create team-specific rules:
1. Go to Rules Management
2. Select "Create Custom Rule"
3. Define criteria and severity
4. Test with sample code
5. Apply to repositories

### Troubleshooting

#### Common Issues

**Bot not commenting on PRs**
- Check repository is enabled
- Verify webhook configuration
- Ensure bot has repository access

**Too many false positives**
- Adjust rule sensitivity in settings
- Add patterns to ignore list
- Use inline ignore comments sparingly

**Performance issues**
- Large PRs may take longer to process
- Consider breaking up large changes
- Check for timeout errors in logs

#### Getting Help

- **Documentation**: https://docs.internal.company.com/codebot
- **Support**: Create ticket at https://help.company.com
- **Slack**: #codebot-support
- **Emergency**: Contact Platform Ops on-call

### Examples

#### Good PR Comment Response
```
Thanks @codebot! I've addressed the security concern in commit abc123.
The style suggestion about variable naming makes sense - updating now.
```

#### Using Ignore Comments
```javascript
// @codebot ignore security - External API requires this format
const apiKey = process.env.LEGACY_API_KEY;
```

### Best Practices

1. **Run Local Checks**: Use pre-commit hooks to catch issues early
2. **Small PRs**: Easier for bot and human reviewers
3. **Descriptive Commits**: Help bot understand context
4. **Address Feedback**: Don't ignore bot suggestions without good reason
5. **Configure Thoughtfully**: Tailor rules to your team's needs

---

**Documentation Version**: 1.0.0
**Last Updated**: 2026-01-30
**Maintained by**: Platform Engineering Team