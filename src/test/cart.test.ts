import { describe, expect, it } from "vitest";
import { clampQty } from "@/lib/cart";

describe("cart quantity limits", () => {
  it("never exceeds 100 per item", () => expect(clampQty(150, 500)).toBe(100));
  it("never exceeds available stock", () => expect(clampQty(10, 4)).toBe(4));
  it("never goes below zero", () => expect(clampQty(-2, 10)).toBe(0));
});
