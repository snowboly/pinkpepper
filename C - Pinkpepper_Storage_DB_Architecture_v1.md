# PinkPepper - Storage & Database Architecture Plan
Version: v1.1  
Audience: Engineering

---

## 1. Architecture Principles

PinkPepper storage must be:
- Secure and private by default
- Tier-aware and cost-controlled
- GDPR-aware
- Scalable to organization-first multi-user model
- Split between structured relational data and object file storage

No public file sharing is supported.

---

## 2. High-Level Architecture

Application Layer  
-> Postgres (structured data + metadata)  
-> Object Storage (private bucket, signed URLs)

---

## 3. Core Entities (MVP Runtime)

- profiles
- subscriptions
- usage_events
- conversations
- chat_messages
- files (metadata only)
- review_requests

---

## 4. File Metadata Model

Store metadata in Postgres; file bytes in object storage.

Suggested fields:
- id
- user_id
- conversation_id (nullable)
- file_name
- file_type
- size_bytes
- storage_path
- expires_at (nullable)
- created_at
- deleted_at (nullable)

---

## 5. Review Request Model

`review_requests` table:
- id
- user_id
- conversation_id
- review_type (quick_check/full_review)
- status (queued/in_review/completed/rejected)
- priority (standard/priority)
- notes
- snapshot_content
- reviewer_notes
- created_at
- updated_at
- completed_at

---

## 6. Tier Storage Rules (Canonical)

From policy document v1.1:
- Free: 50MB temporary, 72h expiry, no persistent vault
- Plus: 200MB persistent vault
- Pro: 500MB persistent vault

Hard cap must be server-side.

---

## 7. Upload Lifecycle

1. Validate MIME
2. Validate size and quota
3. Optional safety scan
4. Upload to private storage path
5. Insert metadata record
6. Update usage counters/metrics

Deletion:
1. Soft-delete metadata
2. Delete object from bucket
3. Recompute/adjust storage usage

---

## 8. Security Model

- Private bucket only
- Signed URLs with short expiry
- Auth + ownership check before URL issuance
- Row-level security on metadata tables
- Access logs for upload/download actions

---

## 9. GDPR Requirements

- Account deletion triggers hard delete of user-linked data
- Scheduled purge for expiring assets
- Support data export endpoint for user data portability

---

## 10. Future-Proofing

Move from user-scoped MVP to full organization-scoped model:
- organizations
- organization_memberships
- organization-scoped storage quotas
- role-based access controls

Design migrations to support gradual cutover (backfill, dual-write, then switch reads).

