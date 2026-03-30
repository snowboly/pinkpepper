# Document Builder Question Blueprints

Date: 2026-03-17
Status: Approved design

## Goal

Replace the current shallow, prompt-led document wizards with document-specific builders that collect the actual structured fields required by each renderer.

The key principle is:
- users should fill the blanks
- AI should assist where useful
- document structure should not depend on model guesswork

## Problem

Most current document builders ask a few broad questions, but the underlying schemas and renderers expect specific structured values.

Current failure mode:
- user answers 4 to 5 general questions
- only a small subset of those answers is mapped into structured fields
- headers, approvers, dates, rows, limits, or table values remain blank or defaulted
- the model improvises too much of the final document

This is acceptable for brainstorming, but not for operational compliance documents.

## Design Principles

All document builders should follow these rules:

1. Ask metadata first.
Always collect the document-control fields that appear in headers or footers.

2. Ask document-specific structured questions.
Do not rely on a shared shallow wizard for different procedures.

3. Use row-based builders for row-based documents.
If the document renderer expects tables, the builder should collect table rows directly.

4. Use defaults only as explicit fallback.
Users should be able to choose:
- use defaults
- use defaults and edit
- enter custom values

5. Use AI as assistant, not layout engine.
AI can help draft:
- hazard descriptions
- control measures
- policy wording
- corrective action language

AI should not be the primary source of:
- document structure
- table shape
- header/footer metadata
- key operational values

## Shared Builder Pattern

All document builders should use this high-level flow:

1. Metadata step
- business / site name
- version or revision if relevant
- date
- created by if relevant
- approved by
- review date if relevant

2. Structured content step
- document-specific fields
- fixed rows
- optional row generation from user description

3. Review step
- show the filled structure before final generation
- allow edit / add row / remove row

4. Generate step
- build structured data
- use AI only for the sections that still require drafted prose

## Approved Document Blueprints

### Temperature Log

This should be almost fully deterministic.

Questions:
1. `Business / site name`
2. `Unit or area being monitored`
3. `What type of temperature log is this?`
Allowed presets:
- `Fridge`
- `Freezer`
- `Hot hold`
- `Cooking`
- `Delivery`
- `Custom`
4. `Target temperature range or critical limit`
Rules:
- if `Fridge` is selected, default to `0C to 4C`
- only allow override when user explicitly selects `Custom`
5. `How many checks per day?`
Choices:
- `1`
- `2`
- `3`
- `4`
6. `How many probe/readings per check?`
Choices:
- `1`
- `2`
- `3`
- `4`
7. `Probe location / note`
8. `Created by`
9. `Approved by`
10. `Month`
11. `Year`

This builder should fill:
- premises
- unit ID
- target range
- checks per day
- probe count
- probe location
- created by
- approved by
- month
- year

### Cleaning Schedule

This is a row-driven document and must not rely mainly on defaults.

Questions:
1. `Premises / site name`
2. `Approved by`
3. `Review date`
4. `Do you want to use standard cleaning chemicals as a starting point?`
Choices:
- `Yes, start with defaults`
- `No, I will enter my own`
- `Start with defaults and edit`
5. `List your cleaning chemicals`
Row fields:
- chemical name
- product
- dilution
- contact time
- active ingredient
- COSHH location
6. `List daily cleaning tasks`
Row fields:
- item / area
- method code
- chemical
- dilution
- contact time
- frequency
- responsible
- verification
7. `List weekly cleaning tasks`
Row fields:
- item / area
- method code
- chemical
- dilution
- contact time
- responsible
- verification
8. `List monthly cleaning tasks`
Row fields:
- item / area
- method code
- chemical
- responsible
- verification
9. `Do you want standard ATP targets?`
Choices:
- `Yes`
- `No, I will enter my own`
10. `If custom, enter ATP target rows`
Row fields:
- surface category
- pass
- borderline
- fail
11. `Do you want a blank cleaning log sheet included?`
Choices:
- `Yes`
- `No`

This builder should fill:
- premises
- approved by
- review date
- chemical reference rows
- daily rows
- weekly rows
- monthly rows
- ATP targets

### Staff Training Record

This should generate a real individual record, not a mostly blank form.

Questions:
1. `Business name`
2. `Approved by`
3. `Employee name`
4. `Job role`
5. `Department`
6. `Start date`
7. `Has induction training been completed?`
Choices:
- `Yes`
- `No`
8. `Induction date`
Only if induction completed
9. `Trainer name`
10. `Which induction topics were covered?`
Structured checklist:
- personal hygiene
- handwashing
- protective clothing
- illness reporting
- cross-contamination prevention
- temperature control
- allergen awareness
- cleaning and sanitation
- pest awareness
- emergency procedures
- site-specific hazards
- custom topic
11. `Induction assessment result`
Choices:
- `Competent`
- `Further training required`
12. `Do you want formal qualifications prefilled or left blank?`
Choices:
- `Leave blank`
- `Add qualifications`
13. `If adding qualifications, list them`
Row fields:
- qualification
- level
- provider
- date achieved
- certificate number
- expiry date
14. `Do you want on-the-job training rows prefilled?`
Choices:
- `Leave blank`
- `Add starter rows`
15. `If adding rows, list on-the-job training`
Row fields:
- date
- task / topic
- trainer
- duration
- assessment
- signature / status

This builder should fill:
- business name
- approved by
- employee metadata
- induction block
- optional qualifications
- optional training rows

### Product Data Sheet

This document is already relatively close, but still needs structured completion of the remaining sections.

Questions:
1. `Business name`
2. `Approved by`
3. `Product name`
4. `Product code / SKU`
5. `Product category`
6. `Product description`
7. `Country of origin`
8. `Ingredients list in descending order by weight`
9. `Contains`
10. `May contain`
11. `Free from`
12. `Storage conditions`
13. `Shelf life unopened`
14. `Shelf life once opened`
15. `Net weight / volume`
16. `Packaging type`
17. `Do you want nutritional values included?`
Choices:
- `Yes`
- `Leave blank`
18. `If yes, enter nutrition values`
Rows:
- energy
- fat
- saturates
- carbohydrate
- sugars
- fibre
- protein
- salt
19. `Do you want microbiological spec included?`
Choices:
- `Yes`
- `Leave blank`
20. `If yes, enter microbiological rows`
Row fields:
- parameter
- limit
- method
- frequency

This builder should fill:
- all main product identity fields
- allergen declaration
- storage and shelf life
- packaging
- optional nutrition values
- optional microbiological specification

### Cleaning SOP

This should be a practical site-level procedure, not broad generic prose.

Questions:
1. `Business / site name`
2. `Approved by`
3. `Area or operation covered`
4. `Purpose of the SOP`
5. `Who is responsible for carrying out cleaning?`
6. `Who verifies cleaning?`
7. `Which surfaces or equipment are covered?`
8. `Which chemicals are used?`
Row fields:
- product
- purpose
- dilution
- contact time
9. `What cleaning frequencies apply?`
Choices:
- `After use`
- `Between tasks`
- `Daily`
- `Weekly`
- `Monthly`
- `Custom`
10. `Describe the core cleaning method`
Preferred approach:
- select `Use standard two-stage clean`
or
- fill structured method steps
11. `What verification method is used?`
Choices:
- `Visual check`
- `Supervisor sign-off`
- `ATP`
- `Allergen swab`
- `Microbiological swab`
- `Combination`
12. `What corrective action should happen if cleaning fails?`
13. `What records should be included?`
Choices:
- `Cleaning sign-off log`
- `Verification log`
- `Corrective action log`
- `Chemical reference table`

This builder should fill:
- metadata
- responsibilities
- chemical inputs
- method logic
- verification
- corrective action
- record choices

### Traceability Procedure

This should create an actual one-up / one-down traceability procedure with recall logic.

Questions:
1. `Business name`
2. `Approved by`
3. `Business type / operation`
4. `Which products or product categories are covered?`
5. `What raw materials or supplier inputs need tracing?`
6. `What identification system do you use?`
Choices:
- `Batch codes`
- `Date codes`
- `Supplier lot codes`
- `Internal production codes`
- `Custom`
7. `Describe how incoming goods are recorded`
8. `Describe how internal production traceability works`
9. `Describe how outgoing goods are recorded`
10. `Who is responsible for traceability records?`
11. `Who leads recalls or withdrawals?`
12. `What recall contact roles or details should be referenced?`
13. `How long are traceability records kept?`
14. `Do you want a mock recall section included?`
Choices:
- `Yes`
- `No`
15. `If yes, how often is mock recall testing done?`
16. `Do you want blank record templates included?`
Choices:
- `Incoming goods log`
- `Production traceability log`
- `Dispatch log`
- `Recall action log`

This builder should fill:
- scope
- product coverage
- record flow
- responsibilities
- recall logic
- retention
- optional record templates

### Pest Control Procedure

This should be driven by real site risks and monitoring controls.

Questions:
1. `Business name`
2. `Approved by`
3. `Business type / site type`
4. `Describe the premises and surroundings`
5. `Which pest risks are relevant?`
Choices:
- `Rodents`
- `Flying insects`
- `Crawling insects`
- `Birds`
- `Stored product insects`
- `Other`
6. `Do you use an external pest control contractor?`
Choices:
- `Yes`
- `No`
7. `If yes, contractor name and visit frequency`
8. `What monitoring devices or methods are used?`
Examples:
- bait stations
- fly killers
- insect traps
- visual inspections
- proofing checks
9. `Who checks pest activity internally?`
10. `How often are internal checks done?`
11. `What should staff do if they find pest activity?`
12. `What proofing or prevention controls are in place?`
13. `What records should be included?`
Choices:
- `Pest sighting log`
- `Contractor visit log`
- `Corrective action log`
- `Site map reference`
- `Proofing checklist`
14. `How long are pest control records kept?`

This builder should fill:
- site risk
- contractor controls
- internal monitoring
- escalation logic
- prevention controls
- record structure

### Waste Management Procedure

This should reflect real waste streams and how they are handled on site.

Questions:
1. `Business name`
2. `Approved by`
3. `Business type`
4. `Which waste streams do you produce?`
Choices:
- `General waste`
- `Food waste`
- `Recyclables`
- `Cardboard`
- `Glass`
- `Used cooking oil`
- `Hazardous / chemicals`
- `Animal by-products`
- `Other`
5. `How is each waste stream segregated?`
Row fields:
- waste type
- container / colour
- storage area
- collection frequency
6. `Who is responsible for waste handling?`
7. `Who cleans and verifies bins or waste areas?`
8. `Do you use external waste contractors?`
Choices:
- `Yes`
- `No`
9. `If yes, list contractors and collection types`
10. `Are there any specific legal or local authority requirements to note?`
11. `How is used cooking oil handled?`
12. `How are animal by-products handled?`
13. `What corrective action should happen if waste control fails?`
14. `What records should be included?`
Choices:
- `Waste transfer note log`
- `Oil collection log`
- `Waste area cleaning log`
- `Corrective action log`
15. `How long are waste records retained?`

This builder should fill:
- waste streams
- segregation and storage
- responsibilities
- contractors
- special waste handling
- corrective action
- records

### Food Safety Policy

This should be a management policy, not a full manual.

Questions:
1. `Business name`
2. `Approved by`
3. `Business type`
4. `Site scope`
5. `What products or services are covered?`
6. `Who has overall food safety responsibility?`
7. `What core commitments should the policy state?`
Choices:
- `Legal compliance`
- `HACCP-based controls`
- `Staff training`
- `Allergen management`
- `Traceability`
- `Cleaning and hygiene`
- `Pest control`
- `Continuous improvement`
- `Audit and review`
- `Customer safety`
8. `Who is responsible for day-to-day implementation?`
9. `How often is the policy reviewed?`
10. `Any standards or frameworks to mention?`
Choices:
- `EC 852/2004`
- `HACCP`
- `BRCGS`
- `SALSA`
- `Internal only`
- `Custom`
11. `Do you want a short management statement included?`
Choices:
- `Yes, generate from my answers`
- `No, keep it minimal`
12. `What document-control details should be included?`
At minimum:
- version
- issue date
- review date
- approved by

This builder should fill:
- scope
- policy commitments
- responsibilities
- review cycle
- document-control structure

### HACCP Plan

This document remains its own advanced structured builder and is already covered by the separate HACCP redesign spec:
- [2026-03-16-haccp-template-redesign-design.md](/C:/Users/Joao/websites/pinkpepper/docs/superpowers/specs/2026-03-16-haccp-template-redesign-design.md)

## Builder Architecture Recommendation

The current grouped wizard pattern should be replaced progressively with document-specific builders.

Recommended implementation shape:

1. Shared metadata step component
Reusable for:
- business name
- version / revision
- date
- created by
- approved by
- review date

2. Row builder component
Reusable for:
- chemicals
- schedule rows
- ATP targets
- qualification rows
- microbiology rows
- traceability rows

3. Per-document field schema
Each document type should define:
- required fields
- optional fields
- default rows
- conditional sections

4. Review step
Users should review structured values before generation/export.

## Implementation Priority

Recommended rollout order:

1. `temperature_log`
2. `cleaning_schedule`
3. `product_data_sheet`
4. `staff_training_record`
5. `cleaning_sop`
6. `traceability_procedure`
7. `pest_control_procedure`
8. `waste_management_procedure`
9. `food_safety_policy`
10. `haccp_plan` refinement

## Success Criteria

This design is successful when:
- each document type uses its own builder or clearly document-specific structured flow
- the builder collects the values required by the renderer instead of leaving them blank
- table-driven documents collect table rows directly
- defaults are optional and explicit
- AI assists with wording, but not core structure
- final documents feel like completed operational templates, not generic AI drafts
