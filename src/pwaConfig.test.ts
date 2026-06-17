import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const viteConfig = readFileSync("vite.config.ts", "utf8");

describe("PWA cache configuration", () => {
  it("does not serve app navigations from a cached index.html", () => {
    expect(viteConfig).toContain("navigateFallback: null");
    expect(viteConfig).toContain('globPatterns: ["**/*.{js,css,svg,webmanifest}"]');
  });
});
