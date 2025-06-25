
-- Create custom types
CREATE TYPE roles AS ENUM ('agent', 'supervisor', 'manager');

-- Create teams table first (referenced by users)
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  supervisor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create users table (extends auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role roles DEFAULT 'agent' NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create hosting_plans table
CREATE TABLE hosting_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan_type TEXT NOT NULL,
  regular_price NUMERIC(10,2) NOT NULL,
  setup_fee NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create plan_discounts table
CREATE TABLE plan_discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES hosting_plans(id) ON DELETE CASCADE NOT NULL,
  billing_cycle TEXT NOT NULL,
  discount_pct INTEGER NOT NULL CHECK (discount_pct >= 0 AND discount_pct <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create sales_entries table
CREATE TABLE sales_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES hosting_plans(id) ON DELETE CASCADE NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  billing_cycle TEXT NOT NULL,
  discount_pct INTEGER NOT NULL CHECK (discount_pct >= 0 AND discount_pct <= 100),
  subscribers_count INTEGER NOT NULL CHECK (subscribers_count > 0),
  order_link TEXT,
  mrr NUMERIC(10,2) NOT NULL,
  tcv NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create plan_upgrades table
CREATE TABLE plan_upgrades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  from_plan_id UUID REFERENCES hosting_plans(id) ON DELETE CASCADE NOT NULL,
  to_plan_id UUID REFERENCES hosting_plans(id) ON DELETE CASCADE NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  order_link TEXT,
  notes TEXT,
  mrr_diff NUMERIC(10,2) NOT NULL,
  tcv_diff NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_users_team_id ON users(team_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_plan_discounts_plan_id ON plan_discounts(plan_id);
CREATE INDEX idx_sales_entries_agent_id ON sales_entries(agent_id);
CREATE INDEX idx_sales_entries_date ON sales_entries(date);
CREATE INDEX idx_plan_upgrades_agent_id ON plan_upgrades(agent_id);
CREATE INDEX idx_plan_upgrades_date ON plan_upgrades(date);
