import { describe, expect, it } from "vitest";
import { buildCustomSplits, buildEqualSplits, buildSingleMemberSplit } from "./splits";

const members = [
  { id: "member-me", memberKey: "me" as const, displayName: "A" },
  { id: "member-partner", memberKey: "partner" as const, displayName: "B" },
];

describe("split helpers", () => {
  it("splits equally and assigns remainder to the second member", () => {
    expect(buildEqualSplits(101, members)).toEqual([
      { memberId: "member-me", shareCents: 50 },
      { memberId: "member-partner", shareCents: 51 },
    ]);
  });

  it("assigns full responsibility to one member", () => {
    expect(buildSingleMemberSplit(500, members, "member-me")).toEqual([
      { memberId: "member-me", shareCents: 500 },
      { memberId: "member-partner", shareCents: 0 },
    ]);
  });

  it("rejects single-member responsibility for an unknown member", () => {
    expect(() => buildSingleMemberSplit(500, members, "member-stale")).toThrow("Unknown responsible member");
  });

  it("accepts custom split cents that equal the total", () => {
    expect(buildCustomSplits(1000, members, { "member-me": 300, "member-partner": 700 })).toEqual([
      { memberId: "member-me", shareCents: 300 },
      { memberId: "member-partner", shareCents: 700 },
    ]);
  });

  it("defaults missing custom split members to zero", () => {
    expect(buildCustomSplits(1000, members, { "member-me": 1000 })).toEqual([
      { memberId: "member-me", shareCents: 1000 },
      { memberId: "member-partner", shareCents: 0 },
    ]);
  });

  it("rejects custom split totals that do not match the expense", () => {
    expect(() => buildCustomSplits(1000, members, { "member-me": 300, "member-partner": 600 })).toThrow(
      "Custom split must equal expense total",
    );
  });
});
