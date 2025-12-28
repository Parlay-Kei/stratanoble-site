# Product Upsell Agent

## Purpose
Manages the grooming product catalog, barber recommendations, affiliate commissions, and post-cut product suggestions.

## Capabilities
- Maintain product catalog with commission rates
- Track barber product recommendations
- Display post-cut product suggestions
- Process product orders with commission splits
- Manage product sample distribution
- Generate commission reports

## Configuration

### Environment Variables
```env
PRODUCT_CDN_URL=https://cdn.directcuts.com/products
DEFAULT_BARBER_COMMISSION_PERCENT=25
AFFILIATE_COOKIE_DAYS=30
```

### Database Tables
```sql
-- Product catalog
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  brand TEXT,
  category TEXT CHECK (category IN ('shampoo', 'conditioner', 'pomade', 'oil', 'balm', 'razor', 'clipper', 'brush', 'kit', 'other')),
  sku TEXT UNIQUE,
  price DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2), -- wholesale cost
  barber_commission_percent DECIMAL(5,2) DEFAULT 25.00,
  image_url TEXT,
  images JSONB, -- array of image URLs
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER,
  is_featured BOOLEAN DEFAULT false,
  is_sample_eligible BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Barber product recommendations
CREATE TABLE IF NOT EXISTS barber_product_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  recommendation_note TEXT, -- "Great for thick, curly hair"
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(barber_id, product_id)
);

-- Post-cut recommendation events
CREATE TABLE IF NOT EXISTS product_recommendation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  barber_id UUID REFERENCES users(id),
  customer_id UUID REFERENCES users(id),
  products_shown UUID[], -- products displayed
  products_clicked UUID[], -- products clicked
  products_purchased UUID[], -- products bought
  shown_at TIMESTAMPTZ DEFAULT NOW(),
  clicked_at TIMESTAMPTZ,
  purchased_at TIMESTAMPTZ
);

-- Product orders
CREATE TABLE IF NOT EXISTS product_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  barber_id UUID REFERENCES users(id), -- referring barber
  booking_id UUID REFERENCES bookings(id), -- related booking
  stripe_payment_intent_id TEXT,
  subtotal DECIMAL(10,2) NOT NULL,
  shipping DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  barber_commission DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'refunded', 'canceled')),
  shipping_address JSONB,
  tracking_number TEXT,
  tracking_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order line items
CREATE TABLE IF NOT EXISTS product_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES product_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) DEFAULT 0
);

-- Barber product samples
CREATE TABLE IF NOT EXISTS barber_product_samples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  status TEXT DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'shipped', 'received')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  shipped_at TIMESTAMPTZ,
  tracking_number TEXT
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_product_recs_barber ON barber_product_recommendations(barber_id);
CREATE INDEX idx_product_orders_customer ON product_orders(customer_id);
CREATE INDEX idx_product_orders_barber ON product_orders(barber_id);
```

## Edge Function: product-service

### Endpoint
`POST /functions/v1/product-service`

### Actions

#### Get Product Catalog
```typescript
// Request
{
  "action": "catalog",
  "category": "pomade", // optional
  "featured": true // optional
}

// Response
{
  "products": [
    {
      "id": "uuid",
      "name": "Suavecito Pomade",
      "brand": "Suavecito",
      "price": 14.99,
      "image": "https://...",
      "barberCommission": 3.75, // 25%
      "inStock": true,
      "rating": 4.8
    }
  ],
  "total": 24
}
```

#### Get Barber Recommendations
```typescript
// Request
{
  "action": "barberRecommendations",
  "barberId": "uuid"
}

// Response
{
  "recommendations": [
    {
      "product": { ... },
      "note": "Perfect for thick, wavy hair",
      "salesCount": 47
    }
  ]
}
```

#### Show Post-Cut Suggestions
```typescript
// Request
{
  "action": "postCutSuggestions",
  "bookingId": "uuid",
  "customerId": "uuid"
}

// Response
{
  "headline": "Your barber Marcus recommends:",
  "products": [
    {
      "id": "uuid",
      "name": "Layrite Cement Clay",
      "price": 18.99,
      "barberNote": "Great for your hair type",
      "image": "https://..."
    }
  ],
  "discount": {
    "code": "FRESH15",
    "percent": 15,
    "validUntil": "2024-01-16T23:59:59Z"
  }
}
```

#### Create Order
```typescript
// Request
{
  "action": "createOrder",
  "customerId": "uuid",
  "barberId": "uuid", // affiliate
  "bookingId": "uuid", // related cut
  "items": [
    { "productId": "uuid", "quantity": 2 }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Las Vegas",
    "state": "NV",
    "zip": "89101"
  },
  "paymentMethodId": "pm_xxx"
}

// Response
{
  "orderId": "uuid",
  "total": 45.97,
  "barberEarns": 11.49,
  "estimatedDelivery": "3-5 business days",
  "confirmation": "DC-ORD-12345"
}
```

#### Request Product Sample
```typescript
// Request
{
  "action": "requestSample",
  "barberId": "uuid",
  "productId": "uuid"
}

// Response
{
  "success": true,
  "status": "approved",
  "message": "Sample will ship within 2-3 business days",
  "remainingMonthlyLimit": 2
}
```

## Post-Cut Flow

```
1. Booking completed → trigger product suggestions
2. Modal shows barber's recommended products
3. Customer can:
   - Add to cart → checkout
   - Save for later → wishlist
   - Dismiss
4. 15% discount expires in 24 hours
5. If purchased → barber earns commission
```

## Commission Structure

| Category | Default Commission | Range |
|----------|-------------------|-------|
| Pomade/Wax | 25% | 20-35% |
| Shampoo/Conditioner | 20% | 15-25% |
| Oils/Balms | 30% | 25-35% |
| Razors/Clippers | 15% | 10-20% |
| Kits/Bundles | 22% | 18-28% |

## Sample Program Rules

- Barbers must be certified
- 3 free samples per month
- Must have sold 5+ products to qualify
- Samples ship free
- Must post content within 30 days

## CLI Commands
```bash
# Sync product catalog
npm run agent:products sync --source=shopify

# Generate commission report
npm run agent:products commissions --barber-id=xxx --period=month

# Process sample requests
npm run agent:products samples --status=requested

# Update stock levels
npm run agent:products stock --sku=xxx --quantity=100
```

## Analytics Events
- `product.viewed`
- `product.recommendation.shown`
- `product.recommendation.clicked`
- `product.added_to_cart`
- `product.purchased`
- `product.commission.earned`
- `product.sample.requested`

## Integration Points
- Post-booking completion screen
- Barber profile (recommended products)
- Customer order history
- Barber earnings dashboard
- Admin product management
