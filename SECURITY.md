# Security Policy

## 🔒 Security Overview

Nerox takes security seriously. This document outlines our security practices and how to report vulnerabilities.

## 📋 Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | ✅ Yes             |
| 1.x.x   | ❌ No              |

## 🛡️ Security Features

### Environment Variable Protection
- All sensitive data (tokens, API keys, webhook URLs) must be stored in `.env` file
- `.env` file is excluded from version control via `.gitignore`
- Configuration loader validates required environment variables on startup

### Input Validation
- Comprehensive validation on all user inputs
- URL validation for music queries
- Permission validation before command execution
- Rate limiting to prevent abuse

### Error Handling
- Advanced anti-crash system prevents process termination
- Errors are logged without exposing sensitive information
- Graceful degradation for non-critical failures

### API Security
- Rate limiting on all API endpoints
- Webhook URL validation
- Secure WebSocket connections

### Data Protection
- Database credentials should never be hardcoded
- Use connection pooling for database operations
- Implement proper access controls

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability, please follow these steps:

### 1. **DO NOT** Create a Public Issue
Public disclosure of security vulnerabilities can put all users at risk.

### 2. Report Privately
Send details to: **security@codes-for.fun**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### 3. Response Time
- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity (see below)

## 📊 Severity Levels

### Critical (24-48 hours)
- Remote code execution
- Database injection
- Authentication bypass
- Token/credential exposure

### High (3-7 days)
- Privilege escalation
- Information disclosure
- DoS vulnerabilities

### Medium (7-14 days)
- Logic errors
- Missing access controls
- CSRF vulnerabilities

### Low (14-30 days)
- Minor information disclosure
- Non-exploitable bugs
- Enhancement opportunities

## ✅ Security Best Practices for Users

### 1. Environment Variables
```bash
# ALWAYS use .env file
TOKEN=your_bot_token_here
LAVALINK_PASSWORD=strong_password_here

# NEVER commit .env to Git
git add .env  # ❌ DON'T DO THIS
```

### 2. Token Rotation
- Rotate your bot token every 90 days
- Regenerate immediately if exposed
- Use Discord Developer Portal to manage tokens

### 3. Webhook Security
- Keep webhook URLs private
- Regenerate webhooks if exposed
- Use HTTPS only

### 4. Server Configuration
```bash
# Use strong Lavalink passwords
LAVALINK_PASSWORD=use-a-strong-random-password-here

# Enable secure connections when possible
LAVALINK_SECURE=true
```

### 5. Permissions
- Grant only required Discord permissions
- Use role-based access control
- Regularly audit bot permissions

### 6. Updates
```bash
# Keep dependencies updated
npm audit
npm audit fix

# Update the bot regularly
git pull origin main
npm install
```

## 🔍 Security Checklist

Before deploying:

- [ ] All secrets are in `.env` file
- [ ] `.env` is in `.gitignore`
- [ ] Strong passwords are used
- [ ] Rate limiting is enabled
- [ ] Error messages don't expose sensitive data
- [ ] Logging doesn't include credentials
- [ ] Dependencies are up to date
- [ ] Permissions follow least privilege principle

## 🛠️ Security Tools

### Dependency Scanning
```bash
# Check for vulnerabilities
npm audit

# Automatic fixes
npm audit fix

# Manual review required
npm audit fix --force
```

### Code Scanning
```bash
# Run linter
npm run lint

# Type checking
npm run build
```

### Runtime Security
The bot includes:
- ✅ Anti-crash system
- ✅ Input validation
- ✅ Rate limiting
- ✅ Error tracking
- ✅ Health monitoring

## 📝 Security Audit Log

### Version 2.0.0 (Current)
- ✅ Removed all hardcoded tokens
- ✅ Implemented environment-based configuration
- ✅ Added comprehensive input validation
- ✅ Enhanced error handling
- ✅ Added rate limiting
- ✅ Implemented secure webhook handling
- ✅ Added security documentation

### Version 1.x.x
- ⚠️ Contained hardcoded credentials (FIXED in 2.0.0)
- ⚠️ Missing input validation (FIXED in 2.0.0)
- ⚠️ Exposed webhook URLs (FIXED in 2.0.0)

## 🔗 Additional Resources

- [Discord Developer Documentation](https://discord.com/developers/docs)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

## 📞 Contact

- **Security Issues**: security@codes-for.fun
- **General Support**: support@codes-for.fun
- **Discord Server**: https://discord.gg/p6nXDJMeyc

## 📜 Disclosure Policy

We follow responsible disclosure:
1. Reporter notifies us privately
2. We confirm and investigate
3. We develop and test a fix
4. We release the fix
5. We publicly disclose (after fix is deployed)

Thank you for helping keep Nerox secure! 🛡️
