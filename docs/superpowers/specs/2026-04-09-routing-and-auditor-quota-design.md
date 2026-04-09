# Consultant and Auditor Routing Design

## Goal

Simplify PinkPepper's model routing and quota system so the product is easier to explain, cheaper to operate, and more consistent in use.

The new design should remove hidden text-chat expert routing and replace it with a clear mode split:

- `Consultant` for day-to-day guidance and practical compliance help
- `Auditor` for formal assessment, findings, evidence gaps, and CAPA-style responses

This design also introduces a dedicated Auditor quota so OpenAI-backed audit use remains commercially controlled.

## Product Direction

PinkPepper should stop mixing invisible model escalation into normal text chat.

Instead:

- users choose `Consultant` or `Auditor`
- each mode has a clear behavior and model path
- pricing and usage rules align with the visible mode, not hidden internal classification

This makes the system easier to trust and easier to price.

## Approved Routing Model

### Consultant

- primary model: `DeepSeek`
- fallback model: `Llama`

Consultant remains the main day-to-day mode for practical operational guidance, drafting help, and general compliance questions.

### Auditor

- primary model: `OpenAI`
- fallback model: `Llama`

Auditor remains the formal assessment mode for structured findings, objective evidence, severity, immediate containment, corrective actions, and closure evidence.

### Image Analysis

- primary model: `OpenAI`

Image and mixed image-text analysis stay on OpenAI because this is the highest-risk interpretation path and should keep the strongest current image capability.

## Why This Split

This design balances cost, quality, and clarity:

- `Consultant` carries most daily traffic, so it should run on the cheaper strong-enough model
- `Auditor` is lower-volume and benefits from the higher-quality ceiling for formal audit outputs
- `Llama` remains available only as a resilience fallback
- `OpenAI` is no longer hidden inside ordinary text chat as a surprise premium path

## Removed Behavior

The system should remove the current hidden expert-answer routing for text chat.

That means:

- no invisible escalation from Consultant to OpenAI based on detected high-risk prompt intent
- no hidden "expert answer" quota deciding which text model is used
- no text-chat premium answer concept in the routing layer

If PinkPepper keeps any human consultancy workflow, that remains a separate product feature and not part of model-routing logic.

## Quota Model

### Normal Daily Messages

The existing daily message caps remain in place by tier.

At the time of this design:

- `Free`: `5/day`
- `Plus`: `25/day`
- `Pro`: `100/day`

### Auditor Daily Quota

Add a dedicated Auditor quota:

- `Free`: `0/day`
- `Plus`: `0/day`
- `Pro`: `5/day`

### Consumption Rule

Every Auditor turn consumes both:

- `1` normal daily message
- `1` auditor daily message

This prevents Auditor mode from becoming a way to bypass general usage controls while still keeping the OpenAI-heavy path bounded.

## Access Model

### Free and Plus

- `Auditor` remains visible in the UI
- sending a message in Auditor mode is gated
- upgrade messaging should make clear that Auditor is a Pro feature

### Pro

Pro users can use Auditor until either of these limits is hit:

- normal daily message limit is reached
- daily Auditor quota of `5` is reached

If the Auditor quota is exhausted, the user can still continue in Consultant mode as long as they still have normal daily messages remaining.

## UX and Messaging

The mode split should be legible in both product copy and plan copy.

### Consultant

Position as:

- practical guidance
- day-to-day questions
- operational help
- drafting and review support

### Auditor

Position as:

- structured findings
- document-based or prompt-based preliminary audits
- severity and evidence-gap assessment
- CAPA-oriented output

### Limits Copy

The user-facing copy should stop referring to hidden expert answers for text chat.

Instead, Pro should communicate:

- higher general daily usage limits
- `5 Auditor messages/day`

## Tracking and Analytics

The backend should keep storing:

- provider
- model
- conversation id
- active mode

Add dedicated Auditor usage tracking so the Auditor quota is easy to inspect and enforce.

This can be done either by:

- a dedicated `auditor_message` usage event type, or
- an equivalent explicit mode-scoped counter

The design preference is a dedicated event type because it is easier to query and reason about later.

## Error and Fallback Behavior

### Consultant

- try `DeepSeek`
- if it fails, try `Llama`
- if both fail, return a clean retry error

### Auditor

- try `OpenAI`
- if it fails, try `Llama`
- if both fail, return a clean retry error

### Image

- try `OpenAI`
- if it fails, return a clean retry error

This keeps the routing simple and predictable.

## Testing Requirements

Implementation should update tests to prove:

- Consultant route uses `DeepSeek` primary and `Llama` fallback
- Auditor route uses `OpenAI` primary and `Llama` fallback
- no hidden text-chat expert escalation remains
- Free and Plus are gated from Auditor use
- Pro is limited to `5` Auditor messages per day
- Auditor turns also count against normal daily message limits
- image path remains on OpenAI

## Alternatives Considered

### 1. Keep OpenAI for hidden high-risk text escalation

This preserves the old expert-routing idea, but it keeps behavior opaque to users and makes pricing and model behavior harder to explain.

Rejected because it hides important product behavior behind internal prompt classification.

### 2. Use DeepSeek for both Consultant and Auditor

This is the cheapest and simplest fully text-based setup.

Rejected for now because Auditor is the lower-volume mode where higher-rigor output quality matters most, and OpenAI is still the safer premium ceiling there.

### 3. Remove OpenAI completely

This would simplify providers further.

Rejected because PinkPepper still benefits from OpenAI in Auditor mode and image analysis.

## Recommended Approach

Use this mode-based routing model:

- `Consultant`: `DeepSeek` -> `Llama`
- `Auditor`: `OpenAI` -> `Llama`
- `Image`: `OpenAI`

And this quota model:

- keep existing normal daily limits
- add `5 Auditor messages/day` on Pro
- make every Auditor turn consume both a normal message and an Auditor message

This is the clearest balance of commercial control, user clarity, and output quality.
