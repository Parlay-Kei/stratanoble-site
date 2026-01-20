# Notion Database Views Setup Guide

This guide provides click-by-click instructions for creating the 8 required views in the Client Tickets database. Since Notion API cannot create database views, these must be configured manually in the Notion UI.

**Database ID:** `2e613b42-8aa7-813d-81d6-cd4e0f8377a7`

---

## Prerequisites

1. Open the Client Tickets database in Notion
2. Ensure you have edit permissions on the database
3. Have all Status options configured: New, Triaged, In Progress, Blocked, Waiting on Client, Ready for Release, Released, Won't Do

---

## View 1: Inbox

**Purpose:** Shows all new tickets that need initial review

### Steps:
1. Click the **+ Add a view** button (or the dropdown next to the current view name)
2. Select **Table** as the view type
3. Name the view: `Inbox`
4. Click **Create**

### Configure Filter:
1. Click **Filter** in the view toolbar
2. Click **+ Add filter**
3. Configure:
   - Property: `Status`
   - Condition: `is`
   - Value: `New`

### Configure Sort:
1. Click **Sort** in the view toolbar
2. Click **+ Add sort**
3. Configure:
   - Property: `Created time`
   - Direction: `Ascending` (oldest first)

### Configure Visible Properties:
1. Click **Properties** in the view toolbar (or the `...` menu > Properties)
2. Show these columns (drag to reorder):
   - Ticket (title)
   - Client
   - Severity
   - Category
   - Intake Source
   - Created time

---

## View 2: Triage Queue

**Purpose:** Shows tickets that have been triaged and are ready for assignment

### Steps:
1. Click **+ Add a view** > **Table** > Name: `Triage Queue`

### Configure Filter:
1. Click **Filter** > **+ Add filter**
2. Configure:
   - Property: `Status`
   - Condition: `is`
   - Value: `Triaged`

### Configure Sort:
1. Click **Sort** > **+ Add sort**
2. First sort:
   - Property: `Severity`
   - Direction: `Ascending` (S1 Critical first)
3. Click **+ Add sort** again
4. Second sort:
   - Property: `Priority Score`
   - Direction: `Descending`

### Configure Visible Properties:
Show these columns:
- Ticket (title)
- Client
- Severity
- Priority Score
- Category
- Owner
- Impact
- Urgency

---

## View 3: This Week

**Purpose:** Shows tickets scheduled for this week's release

### Steps:
1. Click **+ Add a view** > **Table** > Name: `This Week`

### Configure Filter:
1. Click **Filter** > **+ Add filter**
2. First filter:
   - Property: `Status`
   - Condition: `is any of`
   - Values: `Triaged`, `In Progress`
3. Click **+ Add filter** (ensure "and" logic)
4. Second filter:
   - Property: `Release Window`
   - Condition: `is`
   - Value: `This Week`

### Configure Sort:
1. Sort by `Severity` - Ascending
2. Then by `Priority Score` - Descending

### Configure Visible Properties:
Show these columns:
- Ticket (title)
- Client
- Severity
- Status
- Owner
- Priority Score
- Due Date

---

## View 4: Waiting on Client

**Purpose:** Shows tickets awaiting client response

### Steps:
1. Click **+ Add a view** > **Table** > Name: `Waiting on Client`

### Configure Filter:
1. Click **Filter** > **+ Add filter**
2. Configure:
   - Property: `Status`
   - Condition: `is`
   - Value: `Waiting on Client`

### Configure Sort:
1. Sort by `Last edited time` - Ascending (oldest first to identify stale items)

### Configure Visible Properties:
Show these columns:
- Ticket (title)
- Client
- Severity
- Owner
- Last edited time
- Notes

### Visual Indicator for Stale Items:
Consider adding a formula property `Days Waiting` if not already present:
```
dateBetween(now(), prop("Last edited time"), "days")
```

---

## View 5: Blocked

**Purpose:** Shows tickets that are blocked by dependencies or issues

### Steps:
1. Click **+ Add a view** > **Table** > Name: `Blocked`

### Configure Filter:
1. Click **Filter** > **+ Add filter**
2. Configure:
   - Property: `Status`
   - Condition: `is`
   - Value: `Blocked`

### Configure Sort:
1. Sort by `Severity` - Ascending
2. Then by `Last edited time` - Ascending

### Configure Visible Properties:
Show these columns:
- Ticket (title)
- Client
- Severity
- Owner
- Notes (to see blocking reason)
- Last edited time

---

## View 6: Ready for Release

**Purpose:** Shows completed tickets ready to deploy

### Steps:
1. Click **+ Add a view** > **Table** > Name: `Ready for Release`

### Configure Filter:
1. Click **Filter** > **+ Add filter**
2. Configure:
   - Property: `Status`
   - Condition: `is`
   - Value: `Ready for Release`

### Configure Sort:
1. Sort by `Release Window` - Ascending
2. Then by `Client` - Ascending (group by client)

### Configure Visible Properties:
Show these columns:
- Ticket (title)
- Client
- Platform
- Severity
- Release Window
- Owner

---

## View 7: Released (Last 14 Days)

**Purpose:** Shows recently released tickets for reference and follow-up

### Steps:
1. Click **+ Add a view** > **Table** > Name: `Released (Last 14 Days)`

### Configure Filter:
1. Click **Filter** > **+ Add filter**
2. First filter:
   - Property: `Status`
   - Condition: `is`
   - Value: `Released`
3. Click **+ Add filter** (ensure "and" logic)
4. Second filter:
   - Property: `Last edited time`
   - Condition: `is within`
   - Value: `Past 2 weeks`

### Configure Sort:
1. Sort by `Last edited time` - Descending (most recent first)

### Configure Visible Properties:
Show these columns:
- Ticket (title)
- Client
- Platform
- Severity
- Category
- Owner
- Last edited time

---

## View 8: Backlog

**Purpose:** Shows lower priority tickets scheduled for future work

### Steps:
1. Click **+ Add a view** > **Table** > Name: `Backlog`

### Configure Filter:
1. Click **Filter** > **+ Add filter**
2. First filter:
   - Property: `Status`
   - Condition: `is any of`
   - Values: `Triaged`, `New`
3. Click **+ Add filter** (ensure "and" logic)
4. Second filter:
   - Property: `Release Window`
   - Condition: `is`
   - Value: `Backlog`

### Alternative Filter (if Release Window not set):
1. First filter:
   - Property: `Status`
   - Condition: `is any of`
   - Values: `Triaged`, `New`
2. Second filter:
   - Property: `Severity`
   - Condition: `is any of`
   - Values: `S3 Medium`, `S4 Low`

### Configure Sort:
1. Sort by `Priority Score` - Descending
2. Then by `Created time` - Ascending

### Configure Visible Properties:
Show these columns:
- Ticket (title)
- Client
- Severity
- Category
- Priority Score
- Created time
- Notes

---

## View Configuration Tips

### Saving Views
- Views are auto-saved as you configure them
- To rename a view: Click the view name > Edit
- To duplicate a view: Click `...` menu on view tab > Duplicate

### Sharing Views
- Views are shared with all database users by default
- Personal views: Create with "Create for only me" option

### Board View Alternative
For any of these views, you can also create a Board view grouped by Status:
1. Click **+ Add a view** > **Board**
2. Group by: `Status`
3. Apply the same filters as above

### Color Coding
Add color to Status options for visual clarity:
- New: Gray
- Triaged: Blue
- In Progress: Yellow
- Blocked: Red
- Waiting on Client: Orange
- Ready for Release: Green
- Released: Green (darker)
- Won't Do: Gray (darker)

---

## Quick View Checklist

After setup, verify you have these 8 views:

| View Name | Primary Filter | Sort |
|-----------|---------------|------|
| Inbox | Status = New | Created time ASC |
| Triage Queue | Status = Triaged | Severity ASC, Priority Score DESC |
| This Week | Status in (Triaged, In Progress) + Release Window = This Week | Severity ASC |
| Waiting on Client | Status = Waiting on Client | Last edited ASC |
| Blocked | Status = Blocked | Severity ASC |
| Ready for Release | Status = Ready for Release | Release Window ASC |
| Released (Last 14 Days) | Status = Released + Last 14 days | Last edited DESC |
| Backlog | Status in (Triaged, New) + Release Window = Backlog | Priority Score DESC |

---

## Troubleshooting

### "Property not found" error
- Ensure the property exists in the database schema
- Check for exact spelling and capitalization

### View not saving filters
- Refresh the page
- Try creating the view again
- Check browser console for errors

### Duplicate views
- Delete unwanted views by clicking `...` menu > Delete

---

*Document created: System setup verification*
*Last updated: January 2026*
