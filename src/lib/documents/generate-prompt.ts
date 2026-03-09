/**
 * Prompts for structured document generation via Groq JSON mode.
 */

import type { DocumentType } from "./types";

const HACCP_PLAN_SCHEMA = `{
  "document_type": "haccp_plan",
  "version": "1.0",
  "date": "YYYY-MM-DD",
  "business_name": "<name>",
  "business_address": "<address or omit>",
  "product_description": "<product>",
  "intended_use": "<use>",
  "target_consumer": "<consumer group or omit>",
  "process_steps": [
    {
      "step": "<step name>",
      "hazard": "<hazard description>",
      "hazard_type": "biological|chemical|physical|allergen",
      "control_measure": "<control>",
      "monitoring": "<monitoring>"
    }
  ],
  "ccps": [
    {
      "ccp_number": 1,
      "name": "<CCP name>",
      "hazard": "<hazard>",
      "critical_limit": "<limit with units>",
      "monitoring_procedure": "<procedure>",
      "monitoring_frequency": "<frequency>",
      "corrective_action": "<action>",
      "verification": "<verification method>",
      "records": "<records to keep>"
    }
  ],
  "prerequisite_programmes": ["<PRP1>", "<PRP2>"],
  "review_frequency": "<frequency>",
  "approved_by": ""
}`;

const SOP_SCHEMA = `{
  "document_type": "sop",
  "version": "1.0",
  "date": "YYYY-MM-DD",
  "business_name": "<name>",
  "title": "<SOP title>",
  "purpose": "<purpose>",
  "scope": "<scope>",
  "responsibilities": ["<role: responsibility>"],
  "equipment_materials": ["<item>"],
  "steps": [
    {
      "step_number": 1,
      "action": "<action title>",
      "details": "<detailed instructions>",
      "responsible": "<role>"
    }
  ],
  "monitoring": "<monitoring details>",
  "corrective_actions": "<corrective actions>",
  "records": ["<record>"],
  "references": ["<regulation or standard>"],
  "approved_by": ""
}`;

const CLEANING_SCHEDULE_SCHEMA = `{
  "document_type": "cleaning_schedule",
  "version": "1.0",
  "date": "YYYY-MM-DD",
  "business_name": "<name>",
  "entries": [
    {
      "area": "<area>",
      "task": "<task>",
      "frequency": "<daily/weekly/monthly>",
      "method": "<method>",
      "chemical": "<chemical name>",
      "concentration": "<concentration>",
      "contact_time": "<time>",
      "responsible": "<role>"
    }
  ],
  "approved_by": ""
}`;

const TEMPERATURE_LOG_SCHEMA = `{
  "document_type": "temperature_log",
  "version": "1.0",
  "date": "YYYY-MM-DD",
  "business_name": "<name>",
  "columns": [
    {
      "location": "<location>",
      "equipment": "<equipment>",
      "target_temp": "<target>",
      "acceptable_range": "<range>",
      "frequency": "<frequency>",
      "corrective_action": "<action if out of range>"
    }
  ],
  "approved_by": ""
}`;

const SUPPLIER_APPROVAL_SCHEMA = `{
  "document_type": "supplier_approval",
  "version": "1.0",
  "date": "YYYY-MM-DD",
  "business_name": "<name>",
  "suppliers": [
    {
      "supplier_name": "<name>",
      "products_supplied": "<products>",
      "approval_status": "Approved|Conditional|Pending",
      "last_audit_date": "<date or omit>",
      "certificates_held": "<certs or omit>",
      "next_review_date": "<date or omit>"
    }
  ],
  "approval_criteria": ["<criterion>"],
  "approved_by": ""
}`;

const SCHEMAS: Record<DocumentType, string> = {
  haccp_plan: HACCP_PLAN_SCHEMA,
  sop: SOP_SCHEMA,
  cleaning_schedule: CLEANING_SCHEDULE_SCHEMA,
  temperature_log: TEMPERATURE_LOG_SCHEMA,
  supplier_approval: SUPPLIER_APPROVAL_SCHEMA,
};

/**
 * Build the system prompt for structured document generation.
 */
export function buildDocGenSystemPrompt(documentType: DocumentType): string {
  const schema = SCHEMAS[documentType];

  return (
    "You are PinkPepper, an expert food safety document generator.\n\n" +
    "TASK: Generate a complete, professional food safety document as structured JSON.\n\n" +
    "RULES:\n" +
    "1. Output ONLY valid JSON matching the schema below. No markdown, no explanation.\n" +
    "2. All temperatures must include units (°C). All times must include units.\n" +
    "3. Reference specific EU/UK regulations where applicable (e.g., Regulation (EC) No 852/2004).\n" +
    "4. Be comprehensive — include all relevant process steps, hazards, and controls.\n" +
    "5. Use today's date for the 'date' field.\n" +
    "6. Leave 'approved_by' as an empty string (to be filled by the user).\n\n" +
    "JSON SCHEMA:\n" +
    schema
  );
}

/**
 * Detect which document type the user is requesting from their message.
 */
export function detectDocumentType(message: string): DocumentType | null {
  const lower = message.toLowerCase();

  if (/haccp|hazard\s*analysis|critical\s*control/i.test(lower)) return "haccp_plan";
  if (/\bsop\b|standard\s*operating|procedure/i.test(lower)) return "sop";
  if (/clean(ing|er)\s*(schedule|log|plan|rota)/i.test(lower)) return "cleaning_schedule";
  if (/temp(erature)?\s*(log|monitor|record|sheet)/i.test(lower)) return "temperature_log";
  if (/supplier\s*(approv|list|audit|assess)/i.test(lower)) return "supplier_approval";

  return null;
}
