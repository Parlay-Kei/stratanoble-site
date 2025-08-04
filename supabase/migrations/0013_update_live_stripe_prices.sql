-- Update offerings table with actual live Stripe price IDs
-- Replace placeholder prices with real production values

UPDATE offerings SET 
    stripe_price_id = 'price_1RsFQhGEwjQWkTx0mcFlA0Bv',
    nickname = 'Dashboard Lite',
    monthly_price = 30000
WHERE id = 'lite';

UPDATE offerings SET 
    stripe_price_id = 'price_1RsFSGGEwjQWkTx0THs4KEKn',
    nickname = 'Growth Blueprint', 
    monthly_price = 200000
WHERE id = 'growth';

UPDATE offerings SET 
    stripe_price_id = 'price_1RsFWjGEwjQWkTx0FvgCrXva',
    nickname = 'Revenue Partner',
    monthly_price = 400000
WHERE id = 'partner';