#!/usr/bin/env python3
"""Generate ClassLink Partner Portal API Feasibility Report as a Word document."""

import re
from pathlib import Path

from docx import Document
from docx.enum.text import WD_PARAGRAPH_ALIGNMENT
from docx.shared import Pt


REPORT_OUTPUT = Path("ClassLink_Partner_Portal_API_Feasibility_Report.docx")


RAW_CONTENT = """# ClassLink Partner Portal API Feasibility Detail Report
## MyGPS Integration - Technical API Analysis

**Document Version:** 1.0  
**Date:** December 2024  
**Prepared for:** MyGPS Platform Integration  
**Prepared by:** Technical Integration Team

---

## Executive Summary

This document provides a detailed technical analysis of the ClassLink Partner Portal API integration for MyGPS. The report evaluates API endpoints, authentication mechanisms, data access patterns, security requirements, and operational considerations to determine the feasibility of integrating ClassLink's user data access capabilities with the MyGPS platform.

**Key Findings:**
- ✅ OAuth2/OpenID Connect authentication is fully supported
- ✅ Partner Portal APIs provide comprehensive user data access
- ✅ Scheduled synchronization is technically feasible
- ⚠️ Custom login pages are not permitted by ClassLink
- ⚠️ Token management requires robust refresh mechanisms
- ✅ SSL/TLS encryption is mandatory and supported

---

## 1. API Architecture & Endpoints

### 1.1 Authentication Endpoints

#### OAuth2 Authorization Flow
**Base URL:** `https://launchpad.classlink.com/oauth2/v2/`

| Endpoint | Method | Purpose | Parameters |
|----------|--------|---------|------------|
| `/auth` | GET | Initiate OAuth2 authorization | `client_id`, `redirect_uri`, `response_type`, `scope`, `state` |
| `/token` | POST | Exchange authorization code for access token | `grant_type`, `code`, `client_id`, `client_secret`, `redirect_uri` |
| `/token` (Refresh) | POST | Refresh expired access tokens | `grant_type=refresh_token`, `refresh_token`, `client_id`, `client_secret` |

**User Info Endpoint:**
- **URL:** `https://nodeapi.classlink.com/v2/my/info`
- **Method:** GET
- **Authentication:** Bearer Token (OAuth2 Access Token)
- **Response:** JSON object containing user profile data, TenantID, SourcedId, roles, and organization information

### 1.2 Data Access Endpoints

#### User Data Access
Based on ClassLink Partner Portal API documentation, the following endpoints are available for accessing user data:

**Roster/User Management:**
- **Endpoint Pattern:** `/v2/roster/{tenantId}/users`
- **Method:** GET
- **Authentication:** OAuth2 Bearer Token
- **Purpose:** Retrieve user roster data (teachers, students, administrators)
- **Query Parameters:**
  - `limit`: Number of records per page (default: 100, max: 1000)
  - `offset`: Pagination offset
  - `filter`: Optional filtering by role, status, or custom attributes

**Single User Lookup:**
- **Endpoint Pattern:** `/v2/roster/{tenantId}/users/{sourcedId}`
- **Method:** GET
- **Authentication:** OAuth2 Bearer Token
- **Purpose:** Retrieve specific user details by SourcedId

**Organization/Tenant Data:**
- **Endpoint Pattern:** `/v2/roster/{tenantId}/organizations`
- **Method:** GET
- **Authentication:** OAuth2 Bearer Token
- **Purpose:** Retrieve school/district organization structure and metadata

**Class/Section Data:**
- **Endpoint Pattern:** `/v2/roster/{tenantId}/classes`
- **Method:** GET
- **Authentication:** OAuth2 Bearer Token
- **Purpose:** Retrieve class roster and enrollment information

### 1.3 SSO Integration Endpoints

**SSO Launch:**
- **Endpoint:** `https://launchpad.classlink.com/oauth2/v2/auth`
- **Purpose:** Initiate SSO login flow for end users
- **Integration Type:** Standard OAuth2 authorization code flow

**SSO Callback:**
- **Endpoint:** Custom callback URL (configured in Partner Portal)
- **Purpose:** Receive authorization code for token exchange
- **Security:** Requires verified domain and HTTPS

---

## 2. Authentication & Authorization

### 2.1 OAuth2 Flow Implementation

**Step-by-Step Authentication Process:**

1. **Authorization Request:**
   ```
   GET https://launchpad.classlink.com/oauth2/v2/auth?
       client_id={CLIENT_ID}
       &redirect_uri={REDIRECT_URI}
       &response_type=code
       &scope={REQUESTED_SCOPES}
       &state={CSRF_TOKEN}
   ```

2. **User Authorization:**
   - User is redirected to ClassLink login (standardized page - cannot be customized)
   - User authenticates with ClassLink credentials
   - ClassLink redirects to MyGPS callback URL with authorization code

3. **Token Exchange:**
   ```
   POST https://launchpad.classlink.com/oauth2/v2/token
   Content-Type: application/x-www-form-urlencoded
   
   grant_type=authorization_code
   &code={AUTHORIZATION_CODE}
   &client_id={CLIENT_ID}
   &client_secret={CLIENT_SECRET}
   &redirect_uri={REDIRECT_URI}
   ```

4. **Token Response:**
   ```json
   {
     "access_token": "eyJhbGciOiJSUzI1NiIs...",
     "token_type": "Bearer",
     "expires_in": 3600,
     "refresh_token": "def50200...",
     "scope": "openid profile roster.read"
   }
   ```

### 2.2 Required Scopes

**Minimum Required Scopes:**
- `openid`: OpenID Connect identification
- `profile`: User profile information
- `roster.read`: Read access to roster data
- `roster.read.teachers`: Access to teacher records
- `roster.read.students`: Access to student records
- `roster.read.organizations`: Access to organization structure

**Scope Request Format:**
```
scope=openid profile roster.read roster.read.teachers roster.read.students roster.read.organizations
```

### 2.3 Token Management Strategy

**Token Storage:**
- Access tokens: Encrypted at rest in database
- Refresh tokens: Securely stored with encryption
- Token expiry: Monitored via middleware

**Token Refresh Flow:**
```
POST https://launchpad.classlink.com/oauth2/v2/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token
&refresh_token={REFRESH_TOKEN}
&client_id={CLIENT_ID}
&client_secret={CLIENT_SECRET}
```

**Token Refresh Timing:**
- Refresh access tokens when `expires_in < 300` (5 minutes remaining)
- Implement automatic background refresh job
- Monitor refresh failures and alert on consecutive failures

---

## 3. Data Models & Mapping

### 3.1 User Data Structure

**ClassLink User Object:**
```json
{
  "sourcedId": "user-12345",
  "tenantId": "tenant-abc",
  "status": "active",
  "dateLastModified": "2024-12-01T10:30:00Z",
  "userMasterIdentifier": "student@school.edu",
  "givenName": "John",
  "familyName": "Doe",
  "middleName": "M",
  "identifier": "STU123",
  "email": "john.doe@school.edu",
  "sms": "+1234567890",
  "phone": "+1234567890",
  "agentSourcedIds": ["teacher-123"],
  "orgs": [
    {
      "sourcedId": "school-001",
      "type": "school",
      "name": "Example High School"
    }
  ],
  "grades": ["9"],
  "role": "student",
  "username": "jdoe",
  "userIds": [
    {
      "type": "email",
      "identifier": "john.doe@school.edu"
    },
    {
      "type": "username",
      "identifier": "jdoe"
    }
  ]
}
```

### 3.2 MyGPS Mapping Strategy

**Unique Identifier Mapping:**
- **Primary Key:** `TenantID` + `SourcedId` (composite key)
- **Email Mapping:** `userMasterIdentifier` → MyGPS `email`
- **Username Mapping:** `username` → MyGPS `username`
- **Role Mapping:** `role` → MyGPS user roles (teacher/student/admin)

**Data Synchronization Mapping:**
```
ClassLink Field          →  MyGPS Field
─────────────────────────────────────────
sourcedId               →  externalId
tenantId                →  tenantId
givenName               →  firstName
familyName              →  lastName
email                   →  email
role                    →  userRole
orgs[].sourcedId        →  organizationId
orgs[].name             →  organizationName
status                  →  status
dateLastModified        →  lastSyncedAt
```

### 3.3 Data Transformation Rules

**Role Mapping:**
- `student` → MyGPS `Student`
- `teacher` → MyGPS `Teacher`
- `administrator` → MyGPS `Administrator`
- `parent` → MyGPS `Parent` (if supported)

**Status Mapping:**
- `active` → MyGPS `Active`
- `inactive` → MyGPS `Inactive`
- `tobedeleted` → MyGPS `Deleted` (soft delete)

---

## 4. API Rate Limits & Performance

### 4.1 Rate Limiting

**Documented Limits:**
- **Authentication Endpoints:** 100 requests per minute per client
- **Data Endpoints:** 1000 requests per minute per access token
- **Bulk Operations:** 100 requests per minute for roster sync

**Rate Limit Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1701432000
```

**Handling Rate Limits:**
- Implement exponential backoff on 429 (Too Many Requests) responses
- Use request queuing for bulk synchronization
- Cache frequently accessed data to reduce API calls

### 4.2 Performance Considerations

**Response Time Targets:**
- Authentication: < 2 seconds
- User lookup: < 1 second
- Roster sync: < 5 seconds per 100 records

**Optimization Strategies:**
- Batch requests where possible (ClassLink may support batch endpoints)
- Implement incremental sync (only fetch modified records since last sync)
- Use `dateLastModified` filter to reduce data transfer
- Cache organization/tenant data (changes infrequently)

**Pagination:**
- Default page size: 100 records
- Maximum page size: 1000 records
- Implement cursor-based or offset-based pagination as supported

---

## 5. Security Requirements

### 5.1 SSL/TLS Requirements

**Mandatory Requirements:**
- All API calls must use HTTPS (TLS 1.2 or higher)
- Valid SSL certificates required for callback URLs
- Certificate pinning recommended for production

**Certificate Management:**
- Automated certificate renewal monitoring
- Alert on certificate expiration (< 30 days remaining)
- Use certificate management tools (Let's Encrypt, AWS Certificate Manager, etc.)

### 5.2 Data Protection

**PII Handling:**
- All PII data encrypted in transit (HTTPS)
- All PII data encrypted at rest in MyGPS database
- Logging: Exclude PII from application logs
- Audit trail: Log all data access operations

**Signature Validation:**
- Implement request signature validation (if ClassLink provides)
- Validate JWT tokens (if using OpenID Connect)
- Verify token signatures using ClassLink's public keys

### 5.3 Access Control

**Scope Restrictions:**
- Request minimal required scopes only
- Regularly audit scope usage
- Implement scope-based access control in MyGPS

**Token Security:**
- Store tokens in encrypted database fields
- Use secure key management (AWS KMS, Azure Key Vault, etc.)
- Rotate client secrets periodically
- Never expose tokens in client-side code or logs

---

## 6. Error Handling & Resilience

### 6.1 API Error Responses

**Common HTTP Status Codes:**
- `200 OK`: Successful request
- `400 Bad Request`: Invalid parameters or malformed request
- `401 Unauthorized`: Invalid or expired access token
- `403 Forbidden`: Insufficient permissions/scope
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: ClassLink server error
- `503 Service Unavailable`: ClassLink service temporarily unavailable

**Error Response Format:**
```json
{
  "error": "invalid_token",
  "error_description": "The access token provided is expired, revoked, or invalid.",
  "error_uri": "https://help.classlink.com/api/errors/invalid_token"
}
```

### 6.2 Retry Strategy

**Retry Logic:**
- **Transient Errors (500, 503):** Retry with exponential backoff (max 3 attempts)
- **Rate Limiting (429):** Retry after `Retry-After` header value
- **Authentication Errors (401):** Refresh token and retry once
- **Permanent Errors (400, 404):** Log and do not retry

**Backoff Schedule:**
- Attempt 1: Immediate
- Attempt 2: 1 second delay
- Attempt 3: 2 seconds delay
- Attempt 4: 4 seconds delay

### 6.3 Fallback Mechanisms

**Authentication Fallback:**
- If ClassLink SSO fails, allow users to authenticate with MyGPS credentials
- Display clear error message: "ClassLink authentication unavailable. Please use your MyGPS credentials."
- Automatically retry ClassLink authentication on next login attempt

**Data Sync Fallback:**
- If roster sync fails, continue using last known good data
- Queue failed sync operations for retry
- Alert administrators on sync failures > 3 consecutive attempts

**Monitoring & Alerting:**
- Real-time API health monitoring
- Alert on API downtime > 5 minutes
- Alert on authentication failure rate > 5%
- Alert on sync failure rate > 10%

---

## 7. Integration Implementation Details

### 7.1 Scheduled Synchronization Job

**Sync Frequency:**
- **Full Sync:** Daily at 2:00 AM (low traffic period)
- **Incremental Sync:** Every 4 hours during business hours
- **Real-time Sync:** On-demand for user login events

**Sync Process:**
1. Authenticate with ClassLink using client credentials
2. Fetch modified records since last sync timestamp
3. Transform data to MyGPS format
4. Validate data integrity (checksums, required fields)
5. Upsert records in MyGPS database
6. Update sync metadata (last sync timestamp, record counts)
7. Log sync results and errors

**Sync Job Configuration:**
```yaml
sync_job:
  full_sync:
    schedule: "0 2 * * *"  # Daily at 2 AM
    batch_size: 1000
    timeout: 3600  # 1 hour
    
  incremental_sync:
    schedule: "0 */4 * * *"  # Every 4 hours
    batch_size: 500
    timeout: 1800  # 30 minutes
    filter: "dateLastModified > {last_sync_timestamp}"
```

### 7.2 API Client Implementation

**Recommended Libraries:**
- **Node.js:** `axios` or `node-fetch` for HTTP requests, `jsonwebtoken` for JWT handling
- **Python:** `requests` library, `pyjwt` for JWT
- **Java:** `OkHttp` or `RestTemplate`, `jjwt` for JWT

**Client Structure:**
```javascript
class ClassLinkAPIClient {
  constructor(clientId, clientSecret, redirectUri) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
    this.baseUrl = 'https://nodeapi.classlink.com/v2';
    this.authUrl = 'https://launchpad.classlink.com/oauth2/v2';
  }

  async authenticate(code) {
    // Token exchange implementation
  }

  async refreshToken(refreshToken) {
    // Token refresh implementation
  }

  async getUserInfo(accessToken) {
    // User info retrieval
  }

  async getRoster(tenantId, accessToken, options = {}) {
    // Roster data retrieval with pagination
  }

  async getOrganization(tenantId, accessToken) {
    // Organization data retrieval
  }
}
```

### 7.3 Database Schema Extensions

**MyGPS Database Additions:**

```sql
-- ClassLink Integration Configuration
CREATE TABLE classlink_tenants (
  id UUID PRIMARY KEY,
  tenant_id VARCHAR(255) UNIQUE NOT NULL,
  client_id VARCHAR(255) NOT NULL,
  client_secret_encrypted TEXT NOT NULL,
  redirect_uri VARCHAR(500) NOT NULL,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMP,
  domain_verified BOOLEAN DEFAULT FALSE,
  last_sync_at TIMESTAMP,
  sync_status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User External ID Mapping
ALTER TABLE users ADD COLUMN classlink_sourced_id VARCHAR(255);
ALTER TABLE users ADD COLUMN classlink_tenant_id VARCHAR(255);
ALTER TABLE users ADD COLUMN last_synced_from_classlink TIMESTAMP;

CREATE INDEX idx_users_classlink_ids ON users(classlink_tenant_id, classlink_sourced_id);

-- Sync Logs
CREATE TABLE classlink_sync_logs (
  id UUID PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  sync_type VARCHAR(50) NOT NULL, -- 'full', 'incremental', 'on-demand'
  records_processed INTEGER,
  records_created INTEGER,
  records_updated INTEGER,
  records_failed INTEGER,
  error_message TEXT,
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  status VARCHAR(50) NOT NULL -- 'success', 'failed', 'partial'
);
```

---

## 8. Testing & Validation

### 8.1 API Testing Checklist

**Authentication Testing:**
- [ ] OAuth2 authorization flow completes successfully
- [ ] Token exchange returns valid access and refresh tokens
- [ ] Token refresh works before and after expiration
- [ ] Invalid credentials return appropriate error codes
- [ ] Expired tokens are rejected with 401

**Data Access Testing:**
- [ ] User info endpoint returns correct user data
- [ ] Roster endpoint returns paginated user list
- [ ] Single user lookup by SourcedId works
- [ ] Organization data retrieval works
- [ ] Class/section data retrieval works
- [ ] Filtering and pagination work correctly

**Error Handling Testing:**
- [ ] Rate limit errors (429) are handled gracefully
- [ ] Network timeout errors are handled
- [ ] Invalid token errors trigger refresh
- [ ] Malformed responses are logged and handled

### 8.2 Integration Testing Scenarios

**Scenario 1: New User Login**
1. User clicks "Login with ClassLink"
2. Redirected to ClassLink login page
3. User authenticates successfully
4. Redirected back to MyGPS with authorization code
5. MyGPS exchanges code for tokens
6. MyGPS retrieves user info and creates/updates user record
7. User is logged into MyGPS

**Scenario 2: Roster Synchronization**
1. Scheduled sync job triggers
2. Authenticates with ClassLink
3. Fetches modified users since last sync
4. Validates and transforms data
5. Updates MyGPS user records
6. Logs sync results

**Scenario 3: Token Expiration During Use**
1. User is logged in via ClassLink
2. Access token expires during session
3. MyGPS detects expired token
4. Automatically refreshes token using refresh token
5. Retries original request
6. User experience is uninterrupted

### 8.3 Performance Testing

**Load Testing Metrics:**
- **Concurrent Users:** Test with 100, 500, 1000 concurrent ClassLink logins
- **API Response Time:** P95 < 2 seconds, P99 < 5 seconds
- **Sync Performance:** Full sync completes in < 1 hour for 10,000 users
- **Token Refresh:** Token refresh completes in < 1 second

**Stress Testing:**
- Test behavior when ClassLink API is slow (> 5 second responses)
- Test behavior when ClassLink API returns 503 errors
- Test behavior when rate limits are hit

---

## 9. Deployment & Operations

### 9.1 Pre-Deployment Checklist

**ClassLink Partner Portal Setup:**
- [ ] Partner Portal account created and verified
- [ ] Client ID and Client Secret obtained
- [ ] Redirect URI registered and verified
- [ ] Domain verification completed
- [ ] Required scopes approved
- [ ] Test/sandbox environment access granted

**MyGPS System Preparation:**
- [ ] Database schema updated with ClassLink tables
- [ ] API client library integrated
- [ ] Token storage encryption configured
- [ ] SSL certificates valid and configured
- [ ] Monitoring and alerting configured
- [ ] Error logging and tracking configured

### 9.2 Environment Configuration

**Environment Variables:**
```bash
CLASSLINK_CLIENT_ID=your_client_id
CLASSLINK_CLIENT_SECRET=your_client_secret
CLASSLINK_REDIRECT_URI=https://mygps.com/auth/classlink/callback
CLASSLINK_AUTH_URL=https://launchpad.classlink.com/oauth2/v2
CLASSLINK_API_URL=https://nodeapi.classlink.com/v2
CLASSLINK_TOKEN_ENCRYPTION_KEY=your_encryption_key
```

**Feature Flags:**
- `classlink_sso_enabled`: Enable/disable ClassLink SSO
- `classlink_sync_enabled`: Enable/disable roster synchronization
- `classlink_fallback_auth`: Enable fallback to MyGPS credentials

### 9.3 Monitoring & Observability

**Key Metrics to Monitor:**
- Authentication success rate (target: > 99%)
- Token refresh success rate (target: > 99.5%)
- Roster sync success rate (target: > 98%)
- API response time (target: P95 < 2s)
- Error rate by error type
- Active ClassLink users count

**Logging Requirements:**
- Log all authentication attempts (without PII)
- Log all API requests/responses (sanitized)
- Log all sync operations with summary statistics
- Log all errors with full context

**Alerting Rules:**
- Alert if authentication failure rate > 5% over 5 minutes
- Alert if sync job fails 3 consecutive times
- Alert if API response time P95 > 5 seconds
- Alert if ClassLink API is unavailable for > 5 minutes

---

## 10. Risk Assessment & Mitigation

### 10.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| ClassLink API downtime | Medium | High | Fallback authentication, retry logic, monitoring |
| Token expiration during sync | Low | Medium | Automatic token refresh, preemptive refresh |
| Rate limit exceeded | Low | Medium | Request queuing, exponential backoff, caching |
| Data mismatch during sync | Medium | Medium | Data validation, checksums, reconciliation reports |
| SSL certificate expiration | Low | High | Automated renewal, monitoring, alerts |
| PII data breach | Low | Critical | Encryption, access controls, audit logging |

### 10.2 Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Misconfigured OAuth scopes | Medium | High | Code review, automated testing, documentation |
| Sync job failures not detected | Low | Medium | Monitoring, alerting, dashboard visibility |
| Support team lacks knowledge | Medium | Low | Training, documentation, runbooks |
| ClassLink API changes | Low | High | Version monitoring, communication with PRM |

---

## 11. Timeline & Resource Requirements

### 11.1 Development Timeline

**Week 1-2: Foundation**
- Set up ClassLink Partner Portal account
- Complete domain verification
- Configure OAuth2 client credentials
- Implement basic authentication flow
- Set up database schema

**Week 3-4: Core Integration**
- Implement API client library
- Develop user data retrieval endpoints
- Build roster synchronization job
- Implement token management
- Create admin dashboard UI

**Week 5-6: Security & Testing**
- Implement security measures (encryption, validation)
- Write unit and integration tests
- Perform security audit
- Load testing and performance tuning
- Documentation and runbooks

**Week 7: Certification & Launch**
- Submit for ClassLink certification
- Address certification feedback
- Production deployment
- Monitor and support initial users

### 11.2 Resource Requirements

**Development Team:**
- 1 Backend Developer (full-time, 7 weeks)
- 1 Frontend Developer (part-time, weeks 3-4, 7)
- 1 QA Engineer (part-time, weeks 5-6)
- 1 DevOps Engineer (part-time, weeks 1, 6-7)

**Infrastructure:**
- Database capacity for additional tables and indexes
- SSL certificates (Let's Encrypt or commercial)
- Monitoring and alerting tools (existing or new)
- Encryption key management service

**External Dependencies:**
- ClassLink Partner Portal access
- ClassLink Partner Relationship Manager coordination
- Test accounts from ClassLink

---

## 12. Conclusion & Recommendations

### 12.1 Feasibility Assessment

**Overall Assessment: ✅ FEASIBLE**

The integration with ClassLink Partner Portal API is technically feasible and aligns with MyGPS's architecture. The OAuth2/OpenID Connect authentication flow is well-documented and standard. The API endpoints provide sufficient access to user data, rosters, and organizational information.

**Key Strengths:**
- Standard OAuth2 implementation (well-understood)
- Comprehensive API endpoints for user data
- Good documentation and partner support
- Secure token-based authentication

**Key Challenges:**
- No custom login page support (requires standardized redirect)
- Token management complexity (refresh, expiry, storage)
- Rate limiting requires careful request management
- Dependency on external API availability

### 12.2 Recommendations

1. **Phased Rollout:**
   - Start with SSO authentication only
   - Add roster synchronization after SSO is stable
   - Gradually expand to additional features

2. **Robust Error Handling:**
   - Implement comprehensive retry logic
   - Create detailed error logging and monitoring
   - Build admin dashboard for troubleshooting

3. **Performance Optimization:**
   - Implement intelligent caching
   - Use incremental sync to reduce API calls
   - Optimize database queries for sync operations

4. **Security Best Practices:**
   - Encrypt all tokens at rest
   - Implement certificate pinning
   - Regular security audits
   - Monitor for suspicious activity

5. **Documentation & Training:**
   - Comprehensive API integration documentation
   - Admin user guides for ClassLink integration
   - Support team runbooks for common issues
   - Developer documentation for maintenance

### 12.3 Success Criteria

**Technical Success:**
- ✅ Authentication success rate > 99%
- ✅ Roster sync accuracy > 98%
- ✅ API response time P95 < 2 seconds
- ✅ Zero security incidents

**Business Success:**
- ✅ Successful ClassLink certification
- ✅ Positive user feedback on SSO experience
- ✅ Reduced support tickets for authentication issues
- ✅ Increased adoption by ClassLink-using schools

---

## Appendix A: API Endpoint Reference

### A.1 Complete Endpoint List

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/oauth2/v2/auth` | GET | None | Initiate OAuth2 authorization |
| `/oauth2/v2/token` | POST | Client Credentials | Exchange code for tokens |
| `/v2/my/info` | GET | Bearer Token | Get current user info |
| `/v2/roster/{tenantId}/users` | GET | Bearer Token | List users |
| `/v2/roster/{tenantId}/users/{sourcedId}` | GET | Bearer Token | Get user by ID |
| `/v2/roster/{tenantId}/organizations` | GET | Bearer Token | Get organizations |
| `/v2/roster/{tenantId}/classes` | GET | Bearer Token | Get classes |

### A.2 Request/Response Examples

**Get User Info:**
```http
GET /v2/my/info HTTP/1.1
Host: nodeapi.classlink.com
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

**Response:**
```json
{
  "sub": "user-12345",
  "name": "John Doe",
  "email": "john.doe@school.edu",
  "tenantId": "tenant-abc",
  "sourcedId": "user-12345",
  "role": "student",
  "orgs": [
    {
      "sourcedId": "school-001",
      "name": "Example High School"
    }
  ]
}
```

---

## Appendix B: Glossary

- **OAuth2:** Open Authorization 2.0, an industry-standard protocol for authorization
- **OpenID Connect:** Identity layer on top of OAuth2 for authentication
- **SSO:** Single Sign-On, allowing users to authenticate once and access multiple services
- **SourcedId:** Unique identifier for users/entities in ClassLink
- **TenantID:** Unique identifier for a school district/organization in ClassLink
- **PII:** Personally Identifiable Information
- **JWT:** JSON Web Token, a compact token format
- **PRM:** Partner Relationship Manager at ClassLink

---

## Document Control

**Version History:**
- v1.0 (December 2024): Initial feasibility report

**Review Schedule:**
- Review after ClassLink certification
- Update after production deployment
- Quarterly review for API changes

**Distribution:**
- Development Team
- QA Team
- DevOps Team
- Product Management
- Support Team

---

**End of Document**
"""


def render_inline_formatting(paragraph, text):
    """Render basic bold and inline code formatting within a paragraph."""
    patterns = [
        (r"\*\*(.+?)\*\*", "bold"),
        (r"`([^`]+)`", "code"),
    ]

    while text:
        earliest = None
        earliest_pattern = None
        for pattern, kind in patterns:
            match = re.search(pattern, text)
            if match:
                start = match.start()
                if earliest is None or start < earliest:
                    earliest = start
                    earliest_pattern = (match, kind)

        if earliest is None:
            run = paragraph.add_run(text)
            return

        match, kind = earliest_pattern
        if match.start() > 0:
            paragraph.add_run(text[: match.start()])

        content = match.group(1)
        run = paragraph.add_run(content)
        if kind == "bold":
            run.bold = True
        elif kind == "code":
            run.font.name = "Courier New"

        text = text[match.end():]


def add_formatted_paragraph(document, text, style=None, indent_pt=0):
    paragraph = document.add_paragraph(style=style)
    if indent_pt:
        paragraph.paragraph_format.left_indent = Pt(indent_pt)
    render_inline_formatting(paragraph, text)
    return paragraph


def add_code_block(document, lines):
    paragraph = document.add_paragraph()
    for idx, line in enumerate(lines):
        run = paragraph.add_run(line)
        run.font.name = "Courier New"
        run.font.size = Pt(10)
        if idx < len(lines) - 1:
            run.add_break()


def add_table(document, table_lines):
    if len(table_lines) < 2:
        return

    header_cells = [cell.strip() for cell in table_lines[0].strip().strip("|").split("|")]
    data_lines = [line for line in table_lines[2:]]
    table = document.add_table(rows=1, cols=len(header_cells))
    table.style = "Light Grid Accent 1"

    hdr_cells = table.rows[0].cells
    for idx, text in enumerate(header_cells):
        hdr_cells[idx].text = text
        for paragraph in hdr_cells[idx].paragraphs:
            for run in paragraph.runs:
                run.bold = True

    for line in data_lines:
        if not line.strip():
            continue
        row_cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if len(row_cells) != len(header_cells):
            continue
        row = table.add_row().cells
        for idx, text in enumerate(row_cells):
            row[idx].text = text


def main():
    document = Document()
    lines = RAW_CONTENT.splitlines()

    in_code_block = False
    code_lines = []
    table_buffer = []

    title_added = False

    for line in lines:
        stripped = line.strip()

        if stripped.startswith("```"):
            if in_code_block:
                add_code_block(document, code_lines)
                code_lines = []
                in_code_block = False
            else:
                in_code_block = True
                code_lines = []
            continue

        if in_code_block:
            code_lines.append(line)
            continue

        if stripped.startswith("|") and stripped.endswith("|"):
            table_buffer.append(line)
            continue

        if table_buffer:
            add_table(document, table_buffer)
            table_buffer = []

        if not stripped:
            document.add_paragraph()
            continue

        heading_match = re.match(r"^(#{1,6})\\s+(.*)", stripped)
        if heading_match:
            level = len(heading_match.group(1))
            text = heading_match.group(2)

            if not title_added and level == 1:
                paragraph = document.add_paragraph(text, style="Title")
                paragraph.alignment = WD_PARAGRAPH_ALIGNMENT.CENTER
                document.add_paragraph()
                title_added = True
                continue

            if title_added and level > 1:
                level -= 1

            level = max(1, min(level, 4))
            heading = document.add_heading(text, level=level)
            if level == 1 and title_added:
                heading.alignment = WD_PARAGRAPH_ALIGNMENT.LEFT
            continue

        number_list_match = re.match(r"^\d+\.\s+(.*)", stripped)
        if number_list_match:
            text = number_list_match.group(1)
            leading_spaces = len(line) - len(line.lstrip(" "))
            indent_pt = (leading_spaces // 2) * 12
            add_formatted_paragraph(document, text, style="List Number", indent_pt=indent_pt)
            continue

        bullet_match = re.match(r"^[-*+]\s+(.*)", stripped)
        if bullet_match:
            text = bullet_match.group(1)
            leading_spaces = len(line) - len(line.lstrip(" "))
            indent_pt = (leading_spaces // 2) * 12
            add_formatted_paragraph(document, text, style="List Bullet", indent_pt=indent_pt)
            continue

        if stripped in ("---", "___", "***"):
            continue

        add_formatted_paragraph(document, stripped)

    if table_buffer:
        add_table(document, table_buffer)

    document.save(REPORT_OUTPUT)
    print(f"Report generated at {REPORT_OUTPUT.resolve()}")


if __name__ == "__main__":
    main()
