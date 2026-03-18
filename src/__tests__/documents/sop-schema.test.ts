import { describe, expect, it } from "vitest";
import { getDefaultDocNo } from "@/lib/documents/sop-schema";
import {
  buildSopDataFromAnswers,
  buildSopDataFromBuilder,
  buildSopModelPrompt,
} from "@/lib/documents/sop-generation";

describe("getDefaultDocNo", () => {
  it("returns CL-SOP-001 for cleaning_sop", () => {
    expect(getDefaultDocNo("cleaning_sop")).toBe("CL-SOP-001");
  });

  it("returns PC-001 for pest_control_procedure", () => {
    expect(getDefaultDocNo("pest_control_procedure")).toBe("PC-001");
  });

  it("returns FS-POL-001 for food_safety_policy", () => {
    expect(getDefaultDocNo("food_safety_policy")).toBe("FS-POL-001");
  });

  it("falls back to SOP-001 for unknown types", () => {
    // haccp_plan is excluded from SOP path but getDefaultDocNo returns fallback
    expect(getDefaultDocNo("haccp_plan")).toBe("SOP-001");
  });
});

describe("buildSopDataFromAnswers", () => {
  it("extracts business name from first answer", () => {
    const data = buildSopDataFromAnswers("cleaning_sop", ["Harbour Cafe, Bristol", "", "", "", ""]);
    expect(data.metadata.businessName).toBe("Harbour Cafe");
  });

  it("sets the correct doc number for each SOP type", () => {
    const pestData = buildSopDataFromAnswers("pest_control_procedure", ["My Bakery"]);
    expect(pestData.metadata.docNo).toBe("PC-001");

    const wasteData = buildSopDataFromAnswers("waste_management_procedure", ["My Bakery"]);
    expect(wasteData.metadata.docNo).toBe("WM-001");
  });

  it("sets revision to 1", () => {
    const data = buildSopDataFromAnswers("food_safety_policy", ["Test Business"]);
    expect(data.metadata.revision).toBe("1");
  });

  it("carries the document type through", () => {
    const data = buildSopDataFromAnswers("traceability_procedure", ["Test Business"]);
    expect(data.documentType).toBe("traceability_procedure");
  });
});

describe("buildSopDataFromBuilder", () => {
  it("maps structured metadata for traceability procedure builders", () => {
    const data = buildSopDataFromBuilder("traceability_procedure", {
      businessName: "PinkPepper Foods",
      approvedBy: "Operations Manager",
    });

    expect(data.metadata.businessName).toBe("PinkPepper Foods");
    expect(data.metadata.approvedBy).toBe("Operations Manager");
    expect(data.metadata.docNo).toBe("TR-001");
    expect(data.documentType).toBe("traceability_procedure");
  });

  it("maps structured metadata for food safety policy builders", () => {
    const data = buildSopDataFromBuilder("food_safety_policy", {
      businessName: "PinkPepper Foods",
      approvedBy: "Managing Director",
    });

    expect(data.metadata.businessName).toBe("PinkPepper Foods");
    expect(data.metadata.approvedBy).toBe("Managing Director");
    expect(data.metadata.docNo).toBe("FS-POL-001");
    expect(data.documentType).toBe("food_safety_policy");
  });
});

describe("buildSopModelPrompt", () => {
  it("includes structured traceability builder fields in the prompt", () => {
    const data = buildSopDataFromBuilder("traceability_procedure", {
      businessName: "PinkPepper Foods",
      approvedBy: "Operations Manager",
    });

    const prompt = buildSopModelPrompt("traceability_procedure", data, {
      operationType: "Manufacturer",
      productCategories: "Sandwiches, salads",
      supplierInputs: "Cooked chicken, sauces, bread",
      identificationSystem: "Batch codes",
      incomingRecords: "Delivery notes and supplier lot codes",
      internalTraceability: "Batch sheet and label print log",
      outgoingRecords: "Dispatch log and invoices",
      traceabilityOwner: "Technical manager",
      recallLead: "Operations manager",
      recallContacts: "QA lead, managing director",
      retentionPeriod: "12 months",
      mockRecallFrequency: "Quarterly",
    });

    expect(prompt).toContain("Sandwiches, salads");
    expect(prompt).toContain("Batch codes");
    expect(prompt).toContain("Quarterly");
    expect(prompt).toContain("Delivery notes and supplier lot codes");
  });

  it("includes structured pest-control builder fields in the prompt", () => {
    const data = buildSopDataFromBuilder("pest_control_procedure", {
      businessName: "PinkPepper Foods",
      approvedBy: "Operations Manager",
    });

    const prompt = buildSopModelPrompt("pest_control_procedure", data, {
      operationType: "Bakery",
      premisesAndSurroundings: "Urban bakery with rear delivery yard",
      pestRisks: "Rodents, flying insects",
      externalContractor: "Shield Pest Control monthly visits",
      monitoringMethods: "Bait stations and fly killers",
      internalChecks: "Daily opening checks by supervisor",
      escalationFlow: "Report immediately and quarantine affected stock",
      preventionControls: "Door seals, waste control, stock rotation",
      retentionPeriod: "12 months",
    });

    expect(prompt).toContain("Urban bakery with rear delivery yard");
    expect(prompt).toContain("Shield Pest Control monthly visits");
    expect(prompt).toContain("Door seals, waste control, stock rotation");
  });

  it("includes structured waste-management builder fields in the prompt", () => {
    const data = buildSopDataFromBuilder("waste_management_procedure", {
      businessName: "PinkPepper Foods",
      approvedBy: "Operations Manager",
    });

    const prompt = buildSopModelPrompt("waste_management_procedure", data, {
      operationType: "Manufacturer",
      wasteStreams: "General waste, food waste, used cooking oil",
      segregationMethod: "Colour-coded bins in designated areas",
      handlingOwner: "Production team leaders",
      cleaningVerification: "Hygiene supervisor",
      contractors: "EcoWaste weekly; OilCollect fortnightly",
      legalRequirements: "Local authority commercial waste requirements",
      usedOilHandling: "Stored in sealed drums",
      animalByProducts: "Collected in labelled ABP bins",
      correctiveAction: "Re-segregate waste and clean area immediately",
      retentionPeriod: "24 months",
    });

    expect(prompt).toContain("used cooking oil");
    expect(prompt).toContain("EcoWaste weekly");
    expect(prompt).toContain("Re-segregate waste and clean area immediately");
  });

  it("includes structured food-safety-policy builder fields in the prompt", () => {
    const data = buildSopDataFromBuilder("food_safety_policy", {
      businessName: "PinkPepper Foods",
      approvedBy: "Managing Director",
    });

    const prompt = buildSopModelPrompt("food_safety_policy", data, {
      operationType: "Multi-site caterer",
      siteScope: "Two production kitchens",
      productCategories: "Corporate catering and ready meals",
      foodSafetyLead: "Head of Technical",
      dayToDayOwner: "Site managers",
      coreCommitments: "Legal compliance, HACCP, allergen management, training",
      reviewFrequency: "Annually and after major changes",
      standards: "EC 852/2004 and HACCP",
      managementStatement: "Senior management is committed to safe food.",
    });

    expect(prompt).toContain("Two production kitchens");
    expect(prompt).toContain("Head of Technical");
    expect(prompt).toContain("Senior management is committed to safe food.");
  });
});
