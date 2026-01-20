# Notion Database View Setup Instructions

## Overview

You need to create 8 views in the **Client Tickets** database. Each view shows tickets filtered by specific criteria.

**Database URL:** https://www.notion.so/2e613b428aa7813d81d6cd4e0f8377a7

---

## How to Create a View (General Steps)

1. Open the Client Tickets database
2. Click the **dropdown arrow (▼)** next to the current view name (e.g., "Default view")
3. Click **"Add a view"**
4. Select **"Table"** as the view type
5. Type the **view name**
6. Press **Enter**
7. Click the **"Filter"** button in the toolbar (looks like a funnel icon)
8. Click **"Add a filter"**
9. Select the **property** and **value** as specified
10. Click outside the filter menu to close it

---

## Views to Create

### 1. Inbox
**Purpose:** Shows all new tickets that haven't been triaged yet
- **Filter:** Status **is** `New`

### 2. Triage Queue
**Purpose:** Shows tickets needing triage (new or recently triaged)
- **Filter:** Status **is any of** `New`, `Triaged`
- *(Click "Add another filter rule" if needed, then select OR logic)*

### 3. This Week
**Purpose:** Shows tickets scheduled for this week
- **Filter:** Release Window **is** `This Week`

### 4. Waiting on Client
**Purpose:** Shows tickets blocked waiting for client response
- **Filter:** Status **is** `Waiting on Client`

### 5. Blocked
**Purpose:** Shows tickets that are blocked
- **Filter:** Status **is** `Blocked`

### 6. Ready for Release
**Purpose:** Shows tickets that are done and ready to deploy
- **Filter:** Status **is** `Ready for Release`

### 7. Released
**Purpose:** Archive of released tickets
- **Filter:** Status **is** `Released`

### 8. Backlog
**Purpose:** Shows tickets in the backlog
- **Filter:** Release Window **is** `Backlog`

---

## Quick Reference Table

| View Name | Property | Operator | Value(s) |
|-----------|----------|----------|----------|
| Inbox | Status | is | New |
| Triage Queue | Status | is any of | New, Triaged |
| This Week | Release Window | is | This Week |
| Waiting on Client | Status | is | Waiting on Client |
| Blocked | Status | is | Blocked |
| Ready for Release | Status | is | Ready for Release |
| Released | Status | is | Released |
| Backlog | Release Window | is | Backlog |

---

## After Creating Views

Once all 8 views are created, your view tabs should look like:

```
[Default view ▼] [Inbox] [Triage Queue] [This Week] [Waiting on Client] [Blocked] [Ready for Release] [Released] [Backlog]
```

You can hide or rename "Default view" if desired.

---

## Troubleshooting

**Can't find "Add a view"?**
- Click directly on the view name (e.g., "Default view") to open the dropdown

**Filter not showing expected options?**
- Make sure you're selecting the correct property (Status vs Release Window)
- Property names are case-sensitive

**Want to edit a view's filter later?**
- Click on the view tab, then click the "Filter" button to modify

---

## Verification Checklist

- [ ] Inbox view created with Status = New filter
- [ ] Triage Queue view created with Status = New OR Triaged filter
- [ ] This Week view created with Release Window = This Week filter
- [ ] Waiting on Client view created with Status = Waiting on Client filter
- [ ] Blocked view created with Status = Blocked filter
- [ ] Ready for Release view created with Status = Ready for Release filter
- [ ] Released view created with Status = Released filter
- [ ] Backlog view created with Release Window = Backlog filter
