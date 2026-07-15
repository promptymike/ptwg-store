-- A customer must never be able to self-approve a review or forge the
-- "verified purchase" flag by calling PostgREST directly. Server actions are
-- not the security boundary; these checks belong in RLS as well.

drop policy if exists "Users can insert reviews for owned products" on public.product_reviews;
create policy "Users can insert reviews for owned products" on public.product_reviews
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and status = 'pending'::public.review_status
    and exists (
      select 1 from public.library_items li
      where li.user_id = (select auth.uid())
        and li.product_id = product_reviews.product_id
    )
    and (
      (is_verified_purchase = false and order_id is null)
      or (
        is_verified_purchase = true
        and order_id is not null
        and exists (
          select 1
          from public.orders o
          join public.order_items oi on oi.order_id = o.id
          where o.id = product_reviews.order_id
            and o.user_id = (select auth.uid())
            and oi.product_id = product_reviews.product_id
        )
      )
    )
  );

drop policy if exists "Users can update their own pending reviews" on public.product_reviews;
create policy "Users can update their own pending reviews" on public.product_reviews
  for update to authenticated
  using (
    (select auth.uid()) = user_id
    and status = any (
      array['pending'::public.review_status, 'rejected'::public.review_status]
    )
  )
  with check (
    (select auth.uid()) = user_id
    and status = 'pending'::public.review_status
    and exists (
      select 1 from public.library_items li
      where li.user_id = (select auth.uid())
        and li.product_id = product_reviews.product_id
    )
    and (
      (is_verified_purchase = false and order_id is null)
      or (
        is_verified_purchase = true
        and order_id is not null
        and exists (
          select 1
          from public.orders o
          join public.order_items oi on oi.order_id = o.id
          where o.id = product_reviews.order_id
            and o.user_id = (select auth.uid())
            and oi.product_id = product_reviews.product_id
        )
      )
    )
  );

-- Keep planner rows tied to a product the customer still owns. The route
-- handlers already check this, but direct PostgREST writes must match them.
drop policy if exists "planner_instances_update_own" on public.planner_instances;
create policy "planner_instances_update_own" on public.planner_instances
  for update to authenticated
  using (((select auth.uid()) = user_id) or (select public.is_admin()))
  with check (
    (select public.is_admin())
    or (
      (select auth.uid()) = user_id
      and exists (
        select 1 from public.library_items li
        where li.user_id = (select auth.uid())
          and li.product_id = planner_instances.product_id
      )
    )
  );
