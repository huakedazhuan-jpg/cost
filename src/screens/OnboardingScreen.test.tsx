import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { LedgerApi } from "../api/ledgerApi";
import type { Ledger } from "../domain/types";
import { OnboardingScreen } from "./OnboardingScreen";

describe("OnboardingScreen", () => {
  it("asks for a ledger key, then asks for identity", async () => {
    const user = userEvent.setup();
    const ledger: Ledger = {
      id: "ledger-demo",
      name: "共同账本",
      members: [
        { id: "member-me", memberKey: "me", displayName: "A" },
        { id: "member-partner", memberKey: "partner", displayName: "B" },
      ],
    };
    const api: LedgerApi = {
      bootstrap: vi.fn(async () => ({ ledger })),
      listMonth: vi.fn(),
      createExpense: vi.fn(),
      updateExpense: vi.fn(),
      deleteExpense: vi.fn(),
    };
    const onComplete = vi.fn();

    render(<OnboardingScreen api={api} onComplete={onComplete} />);
    await user.type(screen.getByLabelText("账本密钥"), "demo-ledger-key");
    await user.click(screen.getByRole("button", { name: "继续" }));
    await user.click(await screen.findByRole("button", { name: "A" }));

    expect(onComplete).toHaveBeenCalledWith({
      ledgerKey: "demo-ledger-key",
      selectedMemberId: "member-me",
      ledger: expect.objectContaining({ id: "ledger-demo" }),
    });
  });
});
