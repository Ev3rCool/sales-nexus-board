
-- Insert sample hosting plans
INSERT INTO hosting_plans (name, plan_type, regular_price, setup_fee) VALUES
  ('Shared Starter', 'shared', 9.99, 0),
  ('Shared Business', 'shared', 19.99, 0),
  ('Shared Premium', 'shared', 39.99, 0),
  ('VPS Basic', 'vps', 29.99, 25.00),
  ('VPS Professional', 'vps', 59.99, 25.00),
  ('VPS Enterprise', 'vps', 119.99, 50.00),
  ('Dedicated Standard', 'dedicated', 199.99, 100.00),
  ('Dedicated Pro', 'dedicated', 399.99, 100.00),
  ('Dedicated Enterprise', 'dedicated', 799.99, 200.00);

-- Insert sample plan discounts for shared hosting
INSERT INTO plan_discounts (plan_id, billing_cycle, discount_pct)
SELECT p.id, bc.cycle, bc.discount
FROM hosting_plans p
CROSS JOIN (
  VALUES 
    ('m', 0),
    ('a', 70),
    ('biennial', 75),
    ('triennial', 80)
) AS bc(cycle, discount)
WHERE p.plan_type = 'shared';

-- Insert sample plan discounts for VPS
INSERT INTO plan_discounts (plan_id, billing_cycle, discount_pct)
SELECT p.id, bc.cycle, bc.discount
FROM hosting_plans p
CROSS JOIN (
  VALUES 
    ('m', 0),
    ('q', 5),
    ('s-a', 10),
    ('a', 20),
    ('biennial', 25),
    ('triennial', 30)
) AS bc(cycle, discount)
WHERE p.plan_type = 'vps';

-- Insert sample plan discounts for dedicated
INSERT INTO plan_discounts (plan_id, billing_cycle, discount_pct)
SELECT p.id, bc.cycle, bc.discount
FROM hosting_plans p
CROSS JOIN (
  VALUES 
    ('m', 0),
    ('q', 5),
    ('s-a', 10),
    ('a', 15),
    ('biennial', 20),
    ('triennial', 25)
) AS bc(cycle, discount)
WHERE p.plan_type = 'dedicated';

-- Create a sample team
INSERT INTO teams (name) VALUES ('Sales Team Alpha');

-- Note: Sample users and sales data will be created after authentication is set up
