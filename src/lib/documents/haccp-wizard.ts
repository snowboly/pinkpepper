type HaccpWizardQuestion = {
  key: string;
  prompt: string;
};

type HaccpWizardDefinition = {
  questions: HaccpWizardQuestion[];
  conditionalSections: string[];
};

export function buildHaccpWizardDefinition(): HaccpWizardDefinition {
  return {
    questions: [
      {
        key: "companyName",
        prompt: "What is the company name for this HACCP plan?\n\nExample: PinkPepper Foods Ltd",
      },
      {
        key: "version",
        prompt: "What version should appear in the header?\n\nExample: 1.0",
      },
      {
        key: "date",
        prompt: "What date should appear in the header?\n\nExample: 2026-03-16",
      },
      {
        key: "createdBy",
        prompt: "Who should appear as Created by in the footer?\n\nExample: Joao Silva, Food Safety Lead",
      },
      {
        key: "approvedBy",
        prompt: "Who should appear as Approved by in the footer?\n\nExample: Maria Costa, Operations Director",
      },
      {
        key: "processSteps",
        prompt:
          "List the process flow in order. Use one step per line from receiving to dispatch/service.\n\nExample:\nReceive raw chicken\nCold store\nPrep\nCook\nHot hold\nServe",
      },
      {
        key: "hazards",
        prompt:
          "For each step, list the hazards you want covered. Include hazard type (Biological, Chemical, Physical, Allergen), the hazard description, control measure, and whether it is a CCP.\n\nExample:\nStep: Receive raw chicken | Type: Biological | Hazard: temperature abuse during delivery | Control: reject deliveries above 5C | CCP: No",
      },
      {
        key: "ccpDetails",
        prompt:
          "If any hazards are CCPs, provide the CCP number, step name, hazard, critical limit, monitoring, and corrective action. If none, reply 'None'.\n\nExample:\nCCP 1 | Step: Cook | Hazard: survival of pathogens | Critical limit: core temperature >= 75C for 30 seconds | Monitoring: probe every batch | Corrective action: continue cooking and recheck",
      },
    ],
    conditionalSections: ["ccpDetails"],
  };
}
