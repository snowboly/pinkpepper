# PinkPepper -- Food Safety & Compliance OS

**Technical & Product Architecture (v1.1)**

---

## 1. Vision

PinkPepper is an AI-powered Food Safety & Compliance Operating System for food businesses in the EU and UK.

It provides:
- Real-time compliance guidance
- Structured document generation
- Audit support workflows
- Operational risk assistance
- Ongoing compliance memory
- Optional human review for critical outputs

PinkPepper is standalone and operates independently from ilovehaccp.com.

---

## 2. Core Product Philosophy

- AI is the interface.
- Structured compliance logic is the moat.
- Chat is the entry point.
- Structured tools and review workflows drive monetization.
- Saved outputs drive retention.
- Compliance memory plus human validation drives trust.

---

## 3. High-Level System Architecture

User Interface Layer  
-> Application Layer (auth, gating, workflow orchestration)  
-> Compliance Intelligence Layer  
-> LLM + Multimodal Layer  
-> Retrieval Layer (regulatory + KB)  
-> Data + File Storage Layer

---

## 4. Product Layers

### 4.1 Interface Layer

**Free**
- Chat-only experience
- Limited daily usage
- No export
- No human review requests

**Plus**
- Chat
- Structured tools
- PDF export
- Limited monthly human review requests

**Pro**
- Chat
- Full structured tools
- PDF + DOCX export
- Priority human review
- Audit mode and advanced templates

### 4.2 Application Layer

Handles:
- Authentication
- Subscription logic
- Feature gating
- Usage and storage limits
- Tool execution
- Review request workflow
- Activity logging
- Document rendering and export

### 4.3 Compliance Intelligence Layer

Includes:
- HACCP decision logic
- CCP evaluation framework
- PRP validation rules
- Hazard classification logic
- Corrective action templates
- Verification templates
- Allergen and sanitation guidance

### 4.4 LLM + Multimodal Engine

Supports:
- Text reasoning
- Image analysis
- Structured outputs

LLM outputs are advisory and labeled AI-assisted drafts.

### 4.5 Retrieval Layer

Grounded using:
- EU Regulation 852/2004
- UK FSA guidance
- HACCP Codex principles
- Internal templates and structured guidance

---

## 5. Core MVP Modules

### 5.1 Chat Engine (All tiers)
- Compliance Q&A
- Guided drafting support
- Regulatory references

### 5.2 Structured Tool Engine (Plus/Pro)
- SOP generation
- CCP assistant
- Monitoring logs
- Corrective action builder
- Verification templates

### 5.3 Workspace (All tiers with gating)
- Conversation history
- Structured outputs
- Versioned drafts
- Export by plan

### 5.4 Human Review Layer (Plus/Pro)
- Request review from chat workspace
- Quick check and full review modes
- Queue statuses: queued, in_review, completed, rejected
- Reviewer feedback attached to request

---

## 6. Data Architecture Principles

- Server-side enforcement of tier limits
- Strict ownership checks for every data access
- AI output labeling
- Audit-ready logs for usage and exports
- Private object storage for files

---

## 7. Strategic Outcome

PinkPepper evolves into a vertical compliance OS that combines:
- AI drafting speed
- Structured compliance workflows
- Human validation for higher-trust operations

