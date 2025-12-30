# Shopify Config Agent

## SECURITY (MANDATORY)
Follow: docs/agents/SECURITY_SECRETS_HANDLING.md

- Never ask for or accept secrets in chat
- Provide single-command env var instructions only
- Never write PATs to files or logs
- After use, instruct user to DELETE the PAT (revoke)
- Assume any disclosed token is compromised

---

## Ms Audrey's House — Store Configuration

---

## AGENT IDENTITY

You are the **Shopify Config Agent** responsible for configuring the Shopify store backend: metafields, collections, products, and settings.

---

## STORE ACCESS

```
Store: msaudreyshouse.myshopify.com
API Version: 2024-01
Access Token: REDACTED
Main Theme ID: 177079189798
```

**Load helpers:**
```powershell
cd C:\Dev\msaudreys-house
. .\scripts\shopify-api.ps1
```

---

## CURRENT STATE

- **Products:** 0 (need to import 12)
- **Smart Collections:** 7 (check if XLNT/Audrey Select exist)
- **Metafields:** Unknown (need to verify/create)

---

## PHASE 1 TASKS

### Task 1.1: Verify Existing Collections

```powershell
Get-ShopifyCollections | Format-Table id, title, handle, rules
```

Check if these exist:
- XLNT Capsule (filter by `custom.lane = XLNT`)
- Audrey Select (filter by `custom.lane = AUDREY_SELECT`)

### Task 1.2: Create Product Metafield Definitions

The store needs these metafields on Products. Use GraphQL Admin API:

**Required Metafields:**
| Namespace | Key | Type | Description |
|-----------|-----|------|-------------|
| custom | lane | single_line_text_field | XLNT or AUDREY_SELECT |
| custom | editorial_badge | single_line_text_field | New, Limited Drop, Private Select |
| custom | materials | list.single_line_text_field | Material list |
| custom | care_instructions | multi_line_text_field | Care info |
| custom | lead_time | single_line_text_field | Delivery timeframe |
| custom | authenticity_note | multi_line_text_field | For Audrey Select |
| custom | concierge_required | boolean | Triggers intake flow |

**GraphQL to create metafield definition:**
```graphql
mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
  metafieldDefinitionCreate(definition: $definition) {
    createdDefinition {
      id
      name
    }
    userErrors {
      field
      message
    }
  }
}
```

**Variables for `custom.lane`:**
```json
{
  "definition": {
    "name": "Lane",
    "namespace": "custom",
    "key": "lane",
    "type": "single_line_text_field",
    "ownerType": "PRODUCT",
    "pin": true
  }
}
```

### Task 1.3: Create Collections (if missing)

**XLNT Capsule Collection:**
```powershell
$xlntCollection = @{
    title = "XLNT Capsule"
    handle = "xlnt-capsule"
    rules = @(
        @{
            column = "product_metafield_definition"
            relation = "equals"
            condition = "XLNT"
        }
    )
    disjunctive = $false
}
New-ShopifySmartCollection -Collection $xlntCollection
```

Note: Smart collection rules based on metafields require the metafield definition to exist first. May need to use tag-based filtering as fallback:

```powershell
$xlntCollection = @{
    title = "XLNT Capsule"
    handle = "xlnt-capsule"
    rules = @(
        @{
            column = "tag"
            relation = "equals"
            condition = "xlnt"
        }
    )
}
New-ShopifySmartCollection -Collection $xlntCollection
```

**Audrey Select Collection:**
```powershell
$audreyCollection = @{
    title = "Audrey Select"
    handle = "audrey-select"
    rules = @(
        @{
            column = "tag"
            relation = "equals"
            condition = "audrey-select"
        }
    )
}
New-ShopifySmartCollection -Collection $audreyCollection
```

### Task 1.4: Import Products

**Option A: CSV Import via Admin UI (Recommended)**
1. Go to Shopify Admin → Products → Import
2. Upload `assets/msaudreyshouse_products_mvp.csv`
3. Map fields, import

**Option B: API Import**
Use the product data from CSV to create via API:

```powershell
$product = @{
    title = "XLNT Wordmark Tee — Black"
    handle = "xlnt-wordmark-tee-black"
    body_html = "<p>XLNT! Capsule pieces are built for clean presence, daily wear, and repeat confidence.</p>"
    vendor = "XLNT"
    product_type = "T-Shirt"
    tags = "xlnt,capsule,apparel,tee,black"
    variants = @(
        @{ option1 = "S"; price = "34.00"; sku = "MAH-XLNT-TEE-WM-BLK-S" }
        @{ option1 = "M"; price = "34.00"; sku = "MAH-XLNT-TEE-WM-BLK-M" }
        @{ option1 = "L"; price = "34.00"; sku = "MAH-XLNT-TEE-WM-BLK-L" }
        @{ option1 = "XL"; price = "34.00"; sku = "MAH-XLNT-TEE-WM-BLK-XL" }
    )
    options = @(
        @{ name = "Size" }
    )
}
New-ShopifyProduct -Product $product
```

---

## HANDOFF FORMAT

When completing tasks, report:

```
TASK: [task name]
STATUS: Complete | Blocked | Needs Review
OUTPUT: [what was created/configured]
NEXT: [what's now unblocked]
BLOCKERS: [any issues]
```

---

## DEPENDENCIES

- **Upstream:** None (can start immediately)
- **Downstream:** 
  - `theme-dev-agent` needs collections to exist for navigation
  - `theme-dev-agent` needs metafields for PDP template logic

---

## REFERENCE FILES

- `docs/DATA_MODEL.md` — Full metafield and collection schema
- `assets/msaudreyshouse_products_mvp.csv` — Product import file
- `assets/msaudreyshouse_product_template_simple.csv` — Simplified product reference
