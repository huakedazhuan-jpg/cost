import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "./App";

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the onboarding entry point", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "共同记账" })).toBeInTheDocument();
  });

  it("creates a shared expense and shows the monthly settlement suggestion", async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.type(screen.getByLabelText("账本密钥"), "demo-ledger-key");
    await user.click(screen.getByRole("button", { name: "继续" }));
    await user.click(await screen.findByRole("button", { name: "A" }));

    await user.click(await screen.findByRole("button", { name: "新增支出" }));
    await user.type(screen.getByLabelText("金额"), "128");
    await user.clear(screen.getByLabelText("日期"));
    await user.type(screen.getByLabelText("日期"), "2026-06-16");
    await user.type(screen.getByLabelText("备注"), "晚餐");
    await user.click(screen.getByRole("button", { name: "保存" }));

    expect(await screen.findByText("晚餐")).toBeInTheDocument();
    expect(screen.getAllByText("¥128.00")[0]).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "统计" }));

    expect(screen.getByText("本月应补")).toBeInTheDocument();
    expect(screen.getByText("B 应补给 A ¥64.00")).toBeInTheDocument();
  });
});
