create or replace function get_plans_with_discounts()
returns table (
  id bigint,
  name text,
  description text,
  regular_price numeric,
  features jsonb,
  plan_category text,
  created_at timestamptz,
  updated_at timestamptz,
  plan_discounts json
) as $$
begin
  return query
  select
    hp.id,
    hp.name,
    hp.description,
    hp.regular_price,
    hp.features,
    hp.plan_category,
    hp.created_at,
    hp.updated_at,
    (
      select
        json_agg(
          json_build_object(
            'id', pd.id,
            'plan_id', pd.plan_id,
            'name', pd.name,
            'discount_pct', pd.discount_pct,
            'months_valid', pd.months_valid
          )
        )
      from
        plan_discounts pd
      where
        pd.plan_id = hp.id
    ) as plan_discounts
  from
    hosting_plans hp;
end;
$$ language plpgsql;
