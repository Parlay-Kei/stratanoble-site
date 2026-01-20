# Notion Portal Pages Setup Guide

This guide provides click-by-click instructions for configuring the client portal pages with linked database views filtered by client.

---

## Portal Pages Overview

Two portal pages already exist in Notion under the "Support Desk" parent page:

| Client | Portal Name |
|--------|------------|
| DSLV | DSLV Portal |
| MsAudreysHouse | MsAudreysHouse Portal |

Each portal should display only tickets relevant to that specific client.

---

## DSLV Portal Setup

### Step 1: Open the Portal Page
1. Navigate to: the existing "DSLV Portal" page in Notion (under Support Desk)
2. Click anywhere on the page to edit

### Step 2: Add Page Header
1. At the top of the page, add a **Heading 1** block
2. Type: `DSLV Portal`
3. Press Enter to create a new line

### Step 3: Add Introduction Text
1. Add a **Paragraph** block
2. Type: `Welcome to the DSLV Portal. Track your Client Tickets and submit new requests through Slack.`

### Step 4: Add "How to Submit" Section
1. Add a **Heading 2** block
2. Type: `How to Submit a Ticket`
3. Add a **Numbered list**:
   - Post your issue in #support-dslv on Slack
   - Use the "Create Ticket" shortcut (hover over message > ... > Create Ticket)
   - Or use the /ticket command
   - Track status in this portal

### Step 5: Add Linked Database - Active Tickets
1. Add a **Heading 2** block: `Active Tickets`
2. Type `/linked` and select **Linked view of database**
3. Search for and select `Client Tickets` database
4. Click **Create linked view**

#### Configure the Linked View Filter:
1. In the new linked database view, click **Filter**
2. Click **+ Add filter**
3. First filter:
   - Property: `Client`
   - Condition: `is`
   - Value: `DSLV`
4. Click **+ Add filter** (ensure "and" logic)
5. Second filter:
   - Property: `Status`
   - Condition: `is not`
   - Value: `Released`
6. Click **+ Add filter**
7. Third filter:
   - Property: `Status`
   - Condition: `is not`
   - Value: `Won't Do`

#### Configure Sort:
1. Click **Sort**
2. Sort by `Severity` - Ascending
3. Then by `Created time` - Descending

#### Configure Visible Properties:
1. Click **Properties**
2. Show only:
   - Ticket (title)
   - Status
   - Severity
   - Category
   - Created time
   - Notes

#### Rename the View:
1. Click on the view name (likely "Default view")
2. Rename to: `DSLV Active Tickets`

### Step 6: Add Linked Database - Recently Released
1. Add a **Heading 2** block: `Recently Completed`
2. Type `/linked` and select **Linked view of database**
3. Select `Client Tickets` database

#### Configure Filter:
1. First filter:
   - Property: `Client`
   - Condition: `is`
   - Value: `DSLV`
2. Second filter (and):
   - Property: `Status`
   - Condition: `is`
   - Value: `Released`
3. Third filter (and):
   - Property: `Last edited time`
   - Condition: `is within`
   - Value: `Past 30 days`

#### Configure Sort:
1. Sort by `Last edited time` - Descending

#### Rename the View:
1. Rename to: `DSLV Recently Completed`

### Step 7: Add Contact Information
1. Add a **Divider** block (type `---`)
2. Add a **Callout** block
3. Add icon: Information icon
4. Type:
   ```
   Need help? Post in #support-dslv on Slack
   For urgent issues, mention @support-team
   ```

---

## MsAudreysHouse Portal Setup

### Step 1: Open the Portal Page
1. Navigate to: the existing "MsAudreysHouse Portal" page in Notion (under Support Desk)
2. Click anywhere on the page to edit

### Step 2: Add Page Header
1. At the top of the page, add a **Heading 1** block
2. Type: `MsAudreysHouse Portal`

### Step 3: Add Introduction Text
1. Add a **Paragraph** block
2. Type: `Welcome to the MsAudreysHouse Portal. Track your Client Tickets and submit new requests through Slack.`

### Step 4: Add "How to Submit" Section
1. Add a **Heading 2** block: `How to Submit a Ticket`
2. Add a **Numbered list**:
   - Post your issue in #support-msaudreyshouse on Slack
   - Use the "Create Ticket" shortcut (hover over message > ... > Create Ticket)
   - Or use the /ticket command
   - Track status in this portal

### Step 5: Add Linked Database - Active Tickets
1. Add a **Heading 2** block: `Active Tickets`
2. Type `/linked` and select **Linked view of database**
3. Select `Client Tickets` database

#### Configure Filter (Same pattern as DSLV):
1. First filter:
   - Property: `Client`
   - Condition: `is`
   - Value: `MsAudreysHouse`
2. Second filter (and):
   - Property: `Status`
   - Condition: `is not`
   - Value: `Released`
3. Third filter (and):
   - Property: `Status`
   - Condition: `is not`
   - Value: `Won't Do`

#### Configure Sort:
1. Sort by `Severity` - Ascending
2. Then by `Created time` - Descending

#### Configure Visible Properties:
Show only:
- Ticket (title)
- Status
- Severity
- Category
- Created time
- Notes

#### Rename the View:
1. Rename to: `MsAudreysHouse Active Tickets`

### Step 6: Add Linked Database - Recently Released
1. Add a **Heading 2** block: `Recently Completed`
2. Type `/linked` and select **Linked view of database**
3. Select `Client Tickets` database

#### Configure Filter:
1. First filter:
   - Property: `Client`
   - Condition: `is`
   - Value: `MsAudreysHouse`
2. Second filter (and):
   - Property: `Status`
   - Condition: `is`
   - Value: `Released`
3. Third filter (and):
   - Property: `Last edited time`
   - Condition: `is within`
   - Value: `Past 30 days`

#### Configure Sort:
1. Sort by `Last edited time` - Descending

#### Rename the View:
1. Rename to: `MsAudreysHouse Recently Completed`

### Step 7: Add Contact Information
1. Add a **Divider** block
2. Add a **Callout** block with information icon
3. Type:
   ```
   Need help? Post in #support-msaudreyshouse on Slack
   For urgent issues, mention @support-team
   ```

---

## Sharing Portal Pages

### For Internal Use Only (Default)
Portal pages inherit workspace permissions. Team members with access to the workspace can view them.

### For Client Access (Optional)
To share with external clients:

1. Click **Share** in the top-right of the portal page
2. Toggle **Share to web** ON
3. Options:
   - **Allow editing**: OFF (read-only recommended)
   - **Allow comments**: ON (optional for feedback)
   - **Allow duplicate as template**: OFF
4. Copy the public link to share with the client

### Restrict Editing
1. Click **Share**
2. For each team member, set permission to **Can view** instead of **Can edit**
3. Keep **Full access** for portal administrators only

---

## Linked Database View Quick Reference

### Filter Patterns by Portal

| Portal | Client Filter | Status Filter |
|--------|---------------|---------------|
| DSLV | Client = DSLV | Status not in (Released, Won't Do) |
| MsAudreysHouse | Client = MsAudreysHouse | Status not in (Released, Won't Do) |

### Alternative: Status Groups Filter
Instead of excluding statuses, include active ones:
- Status is any of: `New`, `Triaged`, `In Progress`, `Blocked`, `Waiting on Client`, `Ready for Release`

### Property Visibility for Client Portals
**Show (client-friendly):**
- Ticket (title)
- Status
- Severity
- Category
- Created time
- Notes

**Hide (internal only):**
- Owner
- Priority Score
- Impact/Urgency/Effort
- Slack Permalink
- Release Window

---

## Adding Additional Client Portals

For new clients, follow this pattern:

1. Create a new Notion page
2. Add header and introduction
3. Add linked database views with Client filter = [New Client Name]
4. Ensure the Client name exists in the database's Client property options
5. Update `CHANNEL_CLIENT_MAP` in the codebase
6. Add Slack channel mapping in environment variables

---

## Troubleshooting

### Linked Database Not Showing Correct Data
1. Verify filter is set correctly
2. Check that tickets exist with that Client value
3. Ensure property names match exactly (case-sensitive)

### Cannot Add Linked View
1. Verify you have edit permission on the portal page
2. Verify you have access to the Client Tickets database
3. Try refreshing the page

### Client Cannot See Portal
1. Check sharing settings
2. Verify they have workspace access or public link
3. Ensure portal page isn't in a private section

---

## Visual Layout Example

```
+------------------------------------------+
|  [Icon] DSLV Portal              |
+------------------------------------------+
|                                          |
|  Welcome to the DSLV Portal...   |
|                                          |
|  ## How to Submit a Ticket               |
|  1. Post your issue in #support-dslv...  |
|  2. Use the "Create Ticket" shortcut...  |
|  3. Or use the /ticket command           |
|  4. Track status in this portal          |
|                                          |
|  ## Active Tickets                       |
|  +------------------------------------+  |
|  | Ticket | Status | Severity | Date |  |
|  |--------|--------|----------|------|  |
|  | Bug... | New    | S2 High  | 1/10 |  |
|  | Feat...| Triaged| S3 Med   | 1/09 |  |
|  +------------------------------------+  |
|                                          |
|  ## Recently Completed                   |
|  +------------------------------------+  |
|  | Ticket | Status   | Completed     |  |
|  |--------|----------|---------------|  |
|  | Fix... | Released | 1/05          |  |
|  +------------------------------------+  |
|                                          |
|  --------------------------------------- |
|  [i] Need help? Post in #support-dslv    |
+------------------------------------------+
```

---

*Document created: System setup verification*
*Last updated: January 2026*
