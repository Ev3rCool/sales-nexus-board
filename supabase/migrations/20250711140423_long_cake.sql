/*
  # Fix hosting plans loading issues

  1. Schema Updates
    - Update enum types to match TypeScript definitions
    - Ensure proper RLS policies are in place
    - Fix any data type mismatches

  2. RLS Policy Fixes
    - Ensure hosting_plans and plan_discounts are readable by all authenticated users
    - Remove any conflicting policies

  3. Data Validation
    - Ensure sample data uses correct enum values
*/

-- First, let's ensure we have the correct enum types that match our TypeScript definitions
DO $$ BEGIN
    -- Create app_user_role enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_user_role') THEN
        CREATE TYPE app_user_role AS ENUM ('agent', 'supervisor', 'manager');
    END IF;
    
    -- Create billing_cycle enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'billing_cycle') THEN
        CREATE TYPE billing_cycle AS ENUM ('monthly', 'quarterly', 'semi-annual', 'annual');
    END IF;
END $$;

-- Update users table to use the correct enum type if needed
DO $$ BEGIN
    -- Check if we need to update the role column type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'role' 
        AND udt_name != 'app_user_role'
    ) THEN
        -- First, update any existing data to use valid enum values
        UPDATE users SET role = 'agent' WHERE role NOT IN ('agent', 'supervisor', 'manager');
        
        -- Drop the old constraint if it exists
        ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
        
        -- Change the column type
        ALTER TABLE users ALTER COLUMN role TYPE app_user_role USING role::text::app_user_role;
    END IF;
END $$;

-- Update sales_entries table to use the correct enum type if needed
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sales_entries' 
        AND column_name = 'billing_cycle' 
        AND udt_name != 'billing_cycle'
    ) THEN
        -- Update existing data to use valid enum values
        UPDATE sales_entries SET 
            billing_cycle = CASE 
                WHEN billing_cycle IN ('m', 'M') THEN 'monthly'
                WHEN billing_cycle IN ('q', 'Q') THEN 'quarterly'
                WHEN billing_cycle IN ('s-a', 'S-A') THEN 'semi-annual'
                WHEN billing_cycle IN ('a', 'A') THEN 'annual'
                ELSE 'monthly'
            END;
        
        -- Change the column type
        ALTER TABLE sales_entries ALTER COLUMN billing_cycle TYPE billing_cycle USING billing_cycle::text::billing_cycle;
    END IF;
END $$;

-- Update plan_discounts table to use the correct enum type if needed
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'plan_discounts' 
        AND column_name = 'billing_cycle' 
        AND udt_name != 'billing_cycle'
    ) THEN
        -- Update existing data to use valid enum values
        UPDATE plan_discounts SET 
            billing_cycle = CASE 
                WHEN billing_cycle IN ('m', 'M') THEN 'monthly'
                WHEN billing_cycle IN ('q', 'Q') THEN 'quarterly'
                WHEN billing_cycle IN ('s-a', 'S-A') THEN 'semi-annual'
                WHEN billing_cycle IN ('a', 'A') THEN 'annual'
                ELSE 'monthly'
            END;
        
        -- Change the column type
        ALTER TABLE plan_discounts ALTER COLUMN billing_cycle TYPE billing_cycle USING billing_cycle::text::billing_cycle;
    END IF;
END $$;

-- Ensure RLS is properly configured for hosting_plans
ALTER TABLE hosting_plans ENABLE ROW LEVEL SECURITY;

-- Drop any conflicting policies
DROP POLICY IF EXISTS "Allow authenticated users to read hosting plans" ON hosting_plans;
DROP POLICY IF EXISTS "Allow all authenticated users to read hosting plans" ON hosting_plans;
DROP POLICY IF EXISTS "Everyone can view hosting plans" ON hosting_plans;

-- Create a simple, clear policy for reading hosting plans
CREATE POLICY "hosting_plans_read_policy" 
ON hosting_plans 
FOR SELECT 
TO authenticated 
USING (true);

-- Ensure RLS is properly configured for plan_discounts
ALTER TABLE plan_discounts ENABLE ROW LEVEL SECURITY;

-- Drop any conflicting policies
DROP POLICY IF EXISTS "Allow authenticated users to read plan discounts" ON plan_discounts;
DROP POLICY IF EXISTS "Allow all authenticated users to read plan discounts" ON plan_discounts;
DROP POLICY IF EXISTS "Everyone can view plan discounts" ON plan_discounts;

-- Create a simple, clear policy for reading plan discounts
CREATE POLICY "plan_discounts_read_policy" 
ON plan_discounts 
FOR SELECT 
TO authenticated 
USING (true);

-- Ensure we have some sample data (only insert if tables are empty)
INSERT INTO hosting_plans (name, plan_type, regular_price, setup_fee)
SELECT * FROM (VALUES
  ('Shared Starter', 'shared', 9.99, 0),
  ('Shared Business', 'shared', 19.99, 0),
  ('Shared Premium', 'shared', 39.99, 0),
  ('VPS Basic', 'vps', 29.99, 25.00),
  ('VPS Professional', 'vps', 59.99, 25.00),
  ('VPS Enterprise', 'vps', 119.99, 50.00),
  ('Dedicated Standard', 'dedicated', 199.99, 100.00),
  ('Dedicated Pro', 'dedicated', 399.99, 100.00),
  ('Dedicated Enterprise', 'dedicated', 799.99, 200.00)
) AS v(name, plan_type, regular_price, setup_fee)
WHERE NOT EXISTS (SELECT 1 FROM hosting_plans LIMIT 1);

-- Insert sample plan discounts (only if table is empty)
INSERT INTO plan_discounts (plan_id, billing_cycle, discount_pct)
SELECT p.id, bc.cycle::billing_cycle, bc.discount
FROM hosting_plans p
CROSS JOIN (
  VALUES 
    ('monthly', 0),
    ('annual', 20)
) AS bc(cycle, discount)
WHERE NOT EXISTS (SELECT 1 FROM plan_discounts LIMIT 1)
AND p.plan_type = 'shared';

INSERT INTO plan_discounts (plan_id, billing_cycle, discount_pct)
SELECT p.id, bc.cycle::billing_cycle, bc.discount
FROM hosting_plans p
CROSS JOIN (
  VALUES 
    ('monthly', 0),
    ('quarterly', 5),
    ('semi-annual', 10),
    ('annual', 15)
) AS bc(cycle, discount)
WHERE NOT EXISTS (SELECT 1 FROM plan_discounts WHERE plan_id = p.id)
AND p.plan_type IN ('vps', 'dedicated');