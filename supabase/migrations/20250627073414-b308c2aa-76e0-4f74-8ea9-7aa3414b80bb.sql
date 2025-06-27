
-- Enable RLS and create policies for hosting_plans table
ALTER TABLE public.hosting_plans ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read hosting plans
CREATE POLICY "Allow authenticated users to read hosting plans" 
ON public.hosting_plans 
FOR SELECT 
TO authenticated 
USING (true);

-- Enable RLS and create policies for plan_discounts table
ALTER TABLE public.plan_discounts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read plan discounts
CREATE POLICY "Allow authenticated users to read plan discounts" 
ON public.plan_discounts 
FOR SELECT 
TO authenticated 
USING (true);

-- Enable RLS and create policies for sales_entries table
ALTER TABLE public.sales_entries ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own sales entries
CREATE POLICY "Users can read their own sales entries" 
ON public.sales_entries 
FOR SELECT 
TO authenticated 
USING (agent_id = auth.uid());

-- Allow users to insert their own sales entries
CREATE POLICY "Users can insert their own sales entries" 
ON public.sales_entries 
FOR INSERT 
TO authenticated 
WITH CHECK (agent_id = auth.uid());

-- Allow users to update their own sales entries
CREATE POLICY "Users can update their own sales entries" 
ON public.sales_entries 
FOR UPDATE 
TO authenticated 
USING (agent_id = auth.uid());

-- Allow users to delete their own sales entries
CREATE POLICY "Users can delete their own sales entries" 
ON public.sales_entries 
FOR DELETE 
TO authenticated 
USING (agent_id = auth.uid());
