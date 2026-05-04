-- Atomic coupon redemption RPC.
--
-- The previous fulfillment path read coupon_codes.redemption_count, computed
-- redemption_count + 1 in the app and wrote it back. Two concurrent purchases
-- could both observe the same value and the increment would be lost; worse,
-- the max_redemptions check could pass for both, letting the counter exceed
-- the configured cap. This RPC moves the whole flow into a single transaction
-- with a row lock on coupon_codes, so concurrent calls serialize on the
-- coupon row and max_redemptions becomes a hard ceiling.
--
-- Idempotency for webhook retries is handled by the existing unique
-- constraints on coupon_redemptions (stripe_checkout_session_id and the
-- (coupon_id, order_id) pair). ON CONFLICT DO NOTHING absorbs replays
-- without bumping the counter twice.

create or replace function public.record_coupon_redemption(
  p_code text,
  p_order_id uuid,
  p_user_id uuid,
  p_session_id text,
  p_discount_amount integer
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coupon public.coupon_codes%rowtype;
  v_now timestamptz := timezone('utc', now());
  v_redemption_id uuid;
  v_normalized_code text := upper(coalesce(p_code, ''));
  v_discount integer := greatest(coalesce(p_discount_amount, 0), 0);
begin
  if v_normalized_code = ''
     or p_order_id is null
     or p_user_id is null
     or p_session_id is null
     or btrim(p_session_id) = '' then
    return jsonb_build_object('status', 'invalid_input');
  end if;

  -- Take a row lock so concurrent calls for the same coupon serialize.
  select * into v_coupon
  from public.coupon_codes
  where code = v_normalized_code
  for update;

  if not found then
    return jsonb_build_object('status', 'unknown');
  end if;

  if not v_coupon.is_active
     or (v_coupon.starts_at is not null and v_coupon.starts_at > v_now)
     or (v_coupon.expires_at is not null and v_coupon.expires_at < v_now) then
    return jsonb_build_object(
      'status', 'inactive',
      'coupon_id', v_coupon.id
    );
  end if;

  if v_coupon.max_redemptions is not null
     and v_coupon.redemption_count >= v_coupon.max_redemptions then
    return jsonb_build_object(
      'status', 'exhausted',
      'coupon_id', v_coupon.id,
      'redemption_count', v_coupon.redemption_count,
      'max_redemptions', v_coupon.max_redemptions
    );
  end if;

  insert into public.coupon_redemptions (
    coupon_id,
    order_id,
    user_id,
    stripe_checkout_session_id,
    discount_amount
  )
  values (
    v_coupon.id,
    p_order_id,
    p_user_id,
    p_session_id,
    v_discount
  )
  on conflict do nothing
  returning id into v_redemption_id;

  if v_redemption_id is null then
    return jsonb_build_object(
      'status', 'duplicate',
      'coupon_id', v_coupon.id
    );
  end if;

  update public.coupon_codes
     set redemption_count = redemption_count + 1
   where id = v_coupon.id;

  return jsonb_build_object(
    'status', 'recorded',
    'coupon_id', v_coupon.id,
    'redemption_id', v_redemption_id
  );
end;
$$;

revoke all on function public.record_coupon_redemption(text, uuid, uuid, text, integer) from public;
revoke all on function public.record_coupon_redemption(text, uuid, uuid, text, integer) from anon;
revoke all on function public.record_coupon_redemption(text, uuid, uuid, text, integer) from authenticated;
grant execute on function public.record_coupon_redemption(text, uuid, uuid, text, integer) to service_role;
