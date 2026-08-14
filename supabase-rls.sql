-- 🛡️ MAISON D'OR - Supabase RLS Security Policy
-- =========================================================================
-- This script applies strict Row Level Security (RLS) to your database.
-- Run this in the Supabase SQL Editor.
-- =========================================================================

-- 1. Enable RLS on the orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing permissive policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable update for all users" ON public.orders;

-- 3. Policy: Allow insertion from ANYONE (Anon Key)
-- We must allow insertion because the Next.js API uses the anon key to create orders.
CREATE POLICY "Allow public insert"
ON public.orders
FOR INSERT
TO public, anon
WITH CHECK (true);

-- 4. Policy: Block SELECT for public users
-- ONLY the Service Role (which has bypassrls) can read orders. The Anon Key cannot read anything.
CREATE POLICY "Deny public select"
ON public.orders
FOR SELECT
TO public, anon
USING (false);

-- 5. Policy: Block UPDATE for public users
-- ONLY the Service Role can update orders.
CREATE POLICY "Deny public update"
ON public.orders
FOR UPDATE
TO public, anon
USING (false);

-- 6. Policy: Block DELETE for public users
-- ONLY the Service Role can delete orders.
CREATE POLICY "Deny public delete"
ON public.orders
FOR DELETE
TO public, anon
USING (false);

-- 7. Delivery Prices Table
ALTER TABLE public.delivery_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.delivery_prices;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.delivery_prices;
DROP POLICY IF EXISTS "Enable update for all users" ON public.delivery_prices;

-- Allow public read of delivery prices (needed for the checkout page)
CREATE POLICY "Allow public select on delivery_prices"
ON public.delivery_prices
FOR SELECT
TO public, anon
USING (true);

-- Block public update, insert, delete
CREATE POLICY "Deny public modification on delivery_prices"
ON public.delivery_prices
FOR ALL
TO public, anon
USING (false)
WITH CHECK (false);

-- Note: The Next.js API uses the SUPABASE_SERVICE_ROLE_KEY for admin operations 
-- which automatically bypasses RLS. So Admin dashboards will continue to work perfectly.
