CREATE OR REPLACE FUNCTION public.preview_coupon(p_code text, p_subtotal numeric)
RETURNS TABLE(coupon_id uuid, coupon_code text, discount_total numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon public.coupons%ROWTYPE;
  v_discount numeric(12,2);
  v_code text;
BEGIN
  v_code := upper(btrim(coalesce(p_code, '')));
  IF v_code = '' OR p_subtotal IS NULL OR p_subtotal <= 0 THEN
    RAISE EXCEPTION 'COUPON_INVALID';
  END IF;

  SELECT c.* INTO v_coupon
  FROM public.coupons AS c
  WHERE c.code = v_code;

  IF NOT FOUND OR NOT v_coupon.is_active THEN
    RAISE EXCEPTION 'COUPON_INVALID';
  END IF;
  IF v_coupon.starts_at IS NOT NULL AND v_coupon.starts_at > now() THEN
    RAISE EXCEPTION 'COUPON_NOT_STARTED';
  END IF;
  IF v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at <= now() THEN
    RAISE EXCEPTION 'COUPON_EXPIRED';
  END IF;
  IF p_subtotal < v_coupon.min_order_amount THEN
    RAISE EXCEPTION 'COUPON_MINIMUM_NOT_MET';
  END IF;
  IF v_coupon.max_uses IS NOT NULL AND v_coupon.used_count >= v_coupon.max_uses THEN
    RAISE EXCEPTION 'COUPON_LIMIT_REACHED';
  END IF;

  IF v_coupon.discount_type = 'percent' THEN
    v_discount := round((p_subtotal * v_coupon.discount_value) / 100, 2);
  ELSE
    v_discount := v_coupon.discount_value;
  END IF;
  IF v_coupon.max_discount IS NOT NULL THEN
    v_discount := least(v_discount, v_coupon.max_discount);
  END IF;
  v_discount := least(v_discount, p_subtotal);

  IF v_discount <= 0 THEN
    RAISE EXCEPTION 'COUPON_INVALID';
  END IF;

  RETURN QUERY SELECT v_coupon.id, v_coupon.code, v_discount;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.preview_coupon(text, numeric) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.preview_coupon(text, numeric) TO service_role;