import { describe, it, expect } from "vitest";
import { erGyldigIsoDato, formatKroner } from "./format";

describe("formatKroner", () => {
  it("formaterer med norsk tusenskille", () => {
    expect(formatKroner(151354).replace(/\s/g, " ")).toBe("151 354");
  });

  it("håndterer null", () => {
    expect(formatKroner(0)).toBe("0");
  });
});

describe("erGyldigIsoDato", () => {
  it("godtar yyyy-MM-dd", () => {
    expect(erGyldigIsoDato("2026-07-02")).toBe(true);
  });

  it("avviser feil format", () => {
    expect(erGyldigIsoDato("02.07.2026")).toBe(false);
  });

  it("avviser ugyldig dato", () => {
    expect(erGyldigIsoDato("2026-13-40")).toBe(false);
  });
});
