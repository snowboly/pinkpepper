# HACCP Plan Template

**Document No.:** HACCP-001  
**Revision:** 1  
**Date:** _______________  
**Approved by:** _______________  
**Review Date:** _______________

---

## 1. Scope

**Product(s) covered by this HACCP plan:**  
_[Describe the specific product or range of products this plan applies to]_

**Process covered:**  
_[Describe the process from receipt of raw materials to despatch/serving]_

**Premises:**  
_[Name and address of the food business]_

**This HACCP plan does not cover:**  
_[Identify any processes or products explicitly excluded]_

---

## 2. HACCP Team

| Name | Job Title | HACCP Responsibility | Training |
|---|---|---|---|
| | | Team Leader | |
| | | Production | |
| | | Quality / Technical | |
| | | Maintenance | |

---

## 3. Product Description

| Field | Details |
|---|---|
| **Product name** | |
| **Product description** | |
| **Ingredients / raw materials** | |
| **Physical/chemical characteristics** | pH: ___ aw: ___ |
| **Intended shelf life** | |
| **Storage conditions** | |
| **Packaging type** | |
| **Labelling** | |
| **Applicable regulations** | EC 852/2004; EC 853/2004 (if applicable); EC 2073/2005 |
| **Special distribution requirements** | |

---

## 4. Intended Use and Consumer

| Field | Details |
|---|---|
| **Intended use** | e.g. Ready-to-eat / requires cooking before consumption |
| **Target consumer** | e.g. General public / vulnerable groups excluded? |
| **Misuse potential** | e.g. Could be consumed without cooking |
| **Special labelling required** | e.g. "Cook thoroughly before eating" |

---

## 5. Process Flow Diagram

_[Draw or describe the complete process flow. Example for a ready meal:]_

```text
1. RECEIPT OF INGREDIENTS (ambient, chilled, frozen)
   ↓
2. INGREDIENT STORAGE (ambient store / chill <= 5C / freezer <= -18C)
   ↓
3. PREPARATION (portioning, chopping, mixing)
   ↓
4. COOKING (core temperature >= 75C)
   ↓
5. COOLING (>= 63C -> <= 8C within 90 min; blast chiller)
   ↓
6. CHILLED STORAGE (<= 5C)
   ↓
7. PORTIONING / ASSEMBLY
   ↓
8. PACKAGING
   ↓
9. LABELLING (date, use-by, allergens)
   ↓
10. CHILLED DISTRIBUTION (<= 5C)
   ↓
11. CONSUMER
```

**Verification of flow diagram:** Confirmed by on-site inspection by HACCP team on: _______________

---

## 6. Hazard Analysis

For each process step, identify hazards and determine whether they are significant (requiring a CCP or prerequisite programme).

### Hazard Categories

- **B** = Biological (pathogens, spoilage organisms, parasites)
- **C** = Chemical (cleaning chemicals, allergens, pesticides, mycotoxins, migration from FCMs)
- **P** = Physical (foreign bodies: metal, glass, bone, hard plastic, stone)

### Significance Scoring (Risk = Likelihood x Severity)

| Score | Likelihood | Severity |
|---|---|---|
| 1 | Unlikely | Minor (no injury, recovery expected) |
| 2 | Possible | Moderate (medical attention needed) |
| 3 | Likely | Severe (hospitalisation, long-term harm) |
| 4 | Very likely | Critical (fatality, mass casualty) |

**Risk >= 4 = Significant hazard -> proceed to CCP Decision Tree**

### Hazard Analysis Table

| Step | Hazard | B/C/P | Cause | Likelihood (1-4) | Severity (1-4) | Risk Score | Significant? | Control Measure | CCP / PRP |
|---|---|---|---|---|---|---|---|---|---|
| 1. Receipt | Pathogens in raw meat | B | Contaminated supplier | 2 | 4 | 8 | Yes | Supplier approval, delivery temp check | CCP1 |
| 1. Receipt | Foreign body in ingredient | P | Supplier contamination | 1 | 2 | 2 | No | Supplier approval, visual inspection | PRP |
| 1. Receipt | Allergen cross-contact | C | Mislabelled ingredient | 2 | 4 | 8 | Yes | Allergen declaration, check spec | PRP + allergen control |
| 2. Storage | Pathogen growth in chilled ingredient | B | Temp abuse | 2 | 3 | 6 | Yes | Temp monitoring, chill at <= 5C | CCP (temp) |
| 4. Cooking | Survival of pathogens | B | Insufficient heat | 3 | 4 | 12 | Yes | Core temp probe: >= 75C | CCP2 |
| 5. Cooling | Pathogen growth during cooling | B | Slow cooling | 2 | 4 | 8 | Yes | Blast chill; >= 63C -> <= 8C <= 90 min | CCP3 |
| _[Add all process steps]_ | | | | | | | | | |

---

## 7. CCP Decision Tree

Apply to each significant hazard:

```text
Q1: Do control measures exist for this hazard?
    Yes -> Q2    No -> Modify step/product to introduce controls; then Q2

Q2: Is this step specifically designed to eliminate or reduce the hazard to an acceptable level?
    Yes -> CCP   No -> Q3

Q3: Could contamination occur or increase to unacceptable levels at this step?
    No -> Not a CCP   Yes -> Q4

Q4: Will a subsequent step eliminate or reduce the hazard to an acceptable level?
    Yes -> Not a CCP (control at that subsequent step)
    No -> CCP
```

---

## 8. CCP Summary Table (HACCP Control Chart)

| CCP No. | Process Step | Hazard | Critical Limit | Monitoring (What / How / Frequency / Who) | Corrective Action | Records | Verification |
|---|---|---|---|---|---|---|---|
| CCP1 | Receipt of raw meat/poultry | Pathogens - temperature abuse in transit | Delivery temp <= 7C (raw meat) / <= 4C (poultry) | Probe each delivery; visual check / calibrated thermometer / every delivery / delivery operatives | Reject delivery if above limit; document; notify supplier | Delivery temperature log | EHO inspection; micro testing of incoming raw materials quarterly |
| CCP2 | Cooking | Survival of pathogens (Salmonella, Campylobacter, E. coli) | Core temperature >= 75C for >= 2 minutes (England/Wales/NI) or >= 82C (Scotland) | Probe in thickest part of product / calibrated needle probe / every batch / chef | Re-cook to achieve critical limit; if batch cannot be re-cooked, discard | Cooking temperature log | Probe calibration log; periodic test cooking validation |
| CCP3 | Cooling | Growth of pathogens during cooling (Bacillus cereus, Clostridium perfringens, Listeria) | >= 63C -> <= 8C within 90 minutes | Temperature at start and end of cooling cycle / calibrated probe / every cooling event / production operative | Discard product if > 90 minutes; review blast chiller performance | Cooling log | Blast chiller validation; probe calibration log |
| CCP4 | Chilled storage | Pathogen growth (Listeria, C. perfringens) | Storage temperature <= 5C (<= 8C legal) | Fridge temperature check / digital probe or logger / twice daily + continuous logger / operative | Move product to compliant fridge; investigate cause; discard product if > 8C for unknown period | Temperature log; corrective action record | Thermometer calibration; chiller service records |
| _[Add further CCPs as identified in hazard analysis]_ | | | | | | | |

---

## 9. Prerequisite Programmes (PRPs)

The following prerequisite programmes support the HACCP plan by controlling background hazards:

| PRP | Description | Documents / SOPs |
|---|---|---|
| Supplier approval | All raw material suppliers approved and monitored | Supplier approval procedure |
| Cleaning and disinfection | Cleaning schedule for all food-contact surfaces and equipment | Cleaning schedule |
| Personal hygiene | Food handler hygiene policy | Personal hygiene policy; training records |
| Pest control | Contracted pest control; regular monitoring | Pest control log; contractor reports |
| Allergen management | Allergen matrix; segregation; cleaning validation | Allergen control procedure |
| Maintenance and calibration | Equipment PPM; thermometer calibration | Maintenance schedule; calibration log |
| Temperature control | Delivery, storage, cooking, cooling, holding | Temperature monitoring procedure |
| Traceability and recall | Lot coding; one step back/forward traceability | Traceability procedure |
| Training | Food hygiene training; allergen awareness | Training matrix and records |
| Water supply | Potable water; temperature monitoring for Legionella | Water safety plan |
| Waste management | Waste segregation; collection; ABP handling | Waste management procedure |

---

## 10. Verification Schedule

| Activity | Frequency | Responsible | Record |
|---|---|---|---|
| Internal HACCP audit (full review against plan) | Annually or on significant change | Technical/QA manager | Internal audit report |
| CCP record review | Weekly | Supervisor | CCP log review sign-off |
| Probe calibration | Monthly (ice point) / Annually (external) | Technical | Calibration log |
| Microbiological testing of finished product | Quarterly (or as determined by HACCP risk) | Technical | Micro test results |
| Environmental swabbing | Monthly (high-care areas) / Quarterly (general) | Technical | Swab results log |
| Cleaning validation (allergen swabs) | On validation and when cleaning procedure changes | Technical | Swab results |
| Supplier audit or specification review | Annually | Purchasing / Technical | Supplier audit report |
| Process flow diagram on-site check | Annually | HACCP team leader | Sign-off on process flow |
| Consumer complaint review | Monthly | QA | Complaint log |

---

## 11. HACCP Review

This HACCP plan must be reviewed:

- Annually as a minimum
- When a new product or process is introduced
- When a raw material or supplier changes
- When equipment, premises, or packaging changes
- Following a food safety incident or near-miss
- Following a change in legislation or scientific guidance

**Review record:**

| Date | Reason for Review | Changes Made | HACCP Team Sign-Off |
|---|---|---|---|
| | | | |

---

## 12. Supporting Records Index

| Record | Location | Retention Period |
|---|---|---|
| Delivery temperature log | Production folder | 6 months |
| Cooking temperature log | Production folder | Product shelf life + 1 month |
| Cooling log | Production folder | Product shelf life + 1 month |
| Refrigerator/freezer temperature log | Production folder | 3 months |
| Cleaning schedule / records | Kitchen folder | 3 months |
| Pest control reports | Technical file | 2 years |
| Supplier specifications and DoCs | Technical file | Duration of relationship + 2 years |
| Training records | HR / Technical | Employment + 3 years |
| Probe calibration log | Technical file | 2 years |
| Internal audit reports | Technical file | 2 years |
| Corrective action records | Technical file | 2 years |
| Micro test results | Technical file | 2 years |
