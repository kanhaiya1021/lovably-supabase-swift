import { describe, expect, it } from "vitest";
import { couponDiscount } from "@/lib/admin";

describe("coupon discount rules", () => {
  it("applies a percentage discount after the minimum order is met", () => {
    expect(couponDiscount({ discount_type: "percent", discount_value: 10, max_discount: null, min_order_amount: 1000 }, 2000)).toBe(200);
  });

  it("caps a percentage discount at the coupon maximum", () => {
    expect(couponDiscount({ discount_type: "percent", discount_value: 20, max_discount: 150, min_order_amount: 0 }, 2000)).toBe(150);
  });

  it("does not exceed the basket subtotal for a fixed discount", () => {
    expect(couponDiscount({ discount_type: "fixed", discount_value: 500, max_discount: null, min_order_amount: 0 }, 300)).toBe(300);
  });

  it("does not apply a discount below the minimum order amount", () => {
    expect(couponDiscount({ discount_type: "fixed", discount_value: 100, max_discount: null, min_order_amount: 1000 }, 999)).toBe(0);
  });
});