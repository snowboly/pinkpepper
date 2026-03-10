import { describe, it, expect } from "vitest";
import { canExportPdf, canExportDocx } from "@/lib/export/common";

describe("canExportPdf", () => {
  it("free tier cannot export PDF", () => {
    expect(canExportPdf("free")).toBe(false);
  });

  it("plus tier can export PDF", () => {
    expect(canExportPdf("plus")).toBe(true);
  });

  it("pro tier can export PDF", () => {
    expect(canExportPdf("pro")).toBe(true);
  });

  it("admin always can export PDF regardless of tier", () => {
    expect(canExportPdf("free", true)).toBe(true);
  });
});

describe("canExportDocx", () => {
  it("free tier cannot export DOCX", () => {
    expect(canExportDocx("free")).toBe(false);
  });

  it("plus tier cannot export DOCX", () => {
    expect(canExportDocx("plus")).toBe(false);
  });

  it("pro tier can export DOCX", () => {
    expect(canExportDocx("pro")).toBe(true);
  });

  it("admin always can export DOCX regardless of tier", () => {
    expect(canExportDocx("free", true)).toBe(true);
  });
});
