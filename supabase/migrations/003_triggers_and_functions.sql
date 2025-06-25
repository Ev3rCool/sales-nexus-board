
-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'agent'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to calculate MRR and TCV
CREATE OR REPLACE FUNCTION calculate_mrr_tcv(
  regular_price NUMERIC,
  discount_pct INTEGER,
  billing_cycle TEXT,
  subscribers_count INTEGER DEFAULT 1
) RETURNS TABLE(mrr NUMERIC, tcv NUMERIC) AS $$
DECLARE
  discounted_price NUMERIC;
  monthly_price NUMERIC;
  contract_length INTEGER;
BEGIN
  -- Calculate discounted price
  discounted_price := regular_price * (1 - discount_pct / 100.0);
  
  -- Convert to monthly recurring revenue based on billing cycle
  CASE LOWER(billing_cycle)
    WHEN 'm', 'monthly' THEN
      monthly_price := discounted_price;
      contract_length := 1;
    WHEN 'q', 'quarterly' THEN
      monthly_price := discounted_price / 3;
      contract_length := 3;
    WHEN 's-a', 'semi-annual' THEN
      monthly_price := discounted_price / 6;
      contract_length := 6;
    WHEN 'a', 'annual' THEN
      monthly_price := discounted_price / 12;
      contract_length := 12;
    WHEN 'biennial' THEN
      monthly_price := discounted_price / 24;
      contract_length := 24;
    WHEN 'triennial' THEN
      monthly_price := discounted_price / 36;
      contract_length := 36;
    ELSE
      monthly_price := discounted_price / 12; -- Default to annual
      contract_length := 12;
  END CASE;
  
  RETURN QUERY SELECT 
    ROUND((monthly_price * subscribers_count)::NUMERIC, 2) AS mrr,
    ROUND((discounted_price * subscribers_count)::NUMERIC, 2) AS tcv;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-calculate MRR/TCV on sales entries
CREATE OR REPLACE FUNCTION calculate_sales_entry_values()
RETURNS TRIGGER AS $$
DECLARE
  plan_price NUMERIC;
  calculated_values RECORD;
BEGIN
  -- Get the plan's regular price
  SELECT regular_price INTO plan_price
  FROM hosting_plans
  WHERE id = NEW.plan_id;
  
  -- Calculate MRR and TCV
  SELECT * INTO calculated_values
  FROM calculate_mrr_tcv(
    plan_price,
    NEW.discount_pct,
    NEW.billing_cycle,
    NEW.subscribers_count
  );
  
  -- Update the NEW record with calculated values
  NEW.mrr := calculated_values.mrr;
  NEW.tcv := calculated_values.tcv;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate MRR/TCV on sales entries insert/update
CREATE TRIGGER calculate_sales_entry_values_trigger
  BEFORE INSERT OR UPDATE ON sales_entries
  FOR EACH ROW
  EXECUTE FUNCTION calculate_sales_entry_values();

-- Function to calculate upgrade differences
CREATE OR REPLACE FUNCTION calculate_upgrade_diff()
RETURNS TRIGGER AS $$
DECLARE
  from_plan_price NUMERIC;
  to_plan_price NUMERIC;
  from_values RECORD;
  to_values RECORD;
BEGIN
  -- Get plan prices
  SELECT regular_price INTO from_plan_price
  FROM hosting_plans WHERE id = NEW.from_plan_id;
  
  SELECT regular_price INTO to_plan_price
  FROM hosting_plans WHERE id = NEW.to_plan_id;
  
  -- Calculate values for both plans (assuming same billing cycle and discount)
  SELECT * INTO from_values
  FROM calculate_mrr_tcv(from_plan_price, 0, 'annual', 1);
  
  SELECT * INTO to_values
  FROM calculate_mrr_tcv(to_plan_price, 0, 'annual', 1);
  
  -- Calculate differences
  NEW.mrr_diff := to_values.mrr - from_values.mrr;
  NEW.tcv_diff := to_values.tcv - from_values.tcv;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate upgrade differences
CREATE TRIGGER calculate_upgrade_diff_trigger
  BEFORE INSERT OR UPDATE ON plan_upgrades
  FOR EACH ROW
  EXECUTE FUNCTION calculate_upgrade_diff();

-- Function to update hosting_plans updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update hosting_plans updated_at
CREATE TRIGGER update_hosting_plans_updated_at
  BEFORE UPDATE ON hosting_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
