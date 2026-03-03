# PinkPepper - MVP Tier & Usage Policy
Version: v1.1  
Audience: Product + Engineering

---

## 1. Overview

This document is the authoritative MVP policy for:
- Tier entitlements
- Usage limits
- Storage limits
- Retention behavior
- Human review quotas

All limits must be enforced server-side.

---

## 2. Authentication Requirement

- All users (Free, Plus, Pro) must be logged in.
- No anonymous usage.
- Access and usage tied to account ownership.

---

## 3. Tier Definitions

## Free

### Daily Limits
- 15 chat messages/day
- 1 document generation/day
- 0 image uploads/day

### Conversation & Retention
- Up to 10 saved conversations
- Auto-delete after 30 days

### Storage
- 50MB temporary storage
- Files auto-delete after 72 hours
- No persistent vault

### Human Review
- Not available

### After Limit Behavior
- New messages blocked (read-only workspace)
- New document generation blocked
- Existing content remains readable

---

## Plus

### Daily Limits
- 80 chat messages/day
- 4 document generations/day
- 3 image uploads/day

### Conversation & Retention
- Unlimited conversations
- No auto-expiry

### Storage
- 200MB persistent vault
- Flat file list
- Hard storage cap

### Human Review
- 2 review requests/month
- Standard queue
- Target response: within 48 hours

---

## Pro

### Daily Limits
- 250 chat messages/day
- 10 document generations/day
- 10 image uploads/day

### Conversation & Retention
- Unlimited conversations
- No auto-expiry

### Storage
- 500MB persistent vault
- Flat file list
- Hard storage cap

### Human Review
- 10 review requests/month
- Priority queue
- Target response: within 24 hours

---

## 4. Export & Tool Access

- Free: no export
- Plus: PDF export
- Pro: PDF + DOCX export
- Structured tools enabled on Plus/Pro
- Advanced templates and audit-first workflows prioritized for Pro

---

## 5. File Storage Security Rules

- Private bucket only
- No public URLs
- Access through short-lived signed URLs
- Encryption at rest
- HTTPS only
- Strict MIME and size validation
- Ownership validation before signed URL issuance

---

## 6. Cleanup Jobs

- Free files purge after 72 hours
- Free conversations purge after 30 days
- Hard account deletion removes all associated metadata and files

---

## 7. Abuse Protection

- Burst rate limiting
- IP monitoring
- Daily counters reset at UTC midnight
- No public file sharing

---

## 8. Strategic Positioning

- **Free**: trial access
- **Plus**: operational use for small teams
- **Pro**: high-volume and review-assisted workflows

