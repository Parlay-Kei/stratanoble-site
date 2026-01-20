# 📋 Manual Setup Steps

These steps **must be completed manually** as they cannot be automated via the Notion or Slack APIs.

---

## ⚠️ Prerequisites Checklist

Before running `npm run setup:complete`, you must:

- [ ] Add required Slack bot scopes
- [ ] Reinstall Slack app to workspace
- [ ] Verify bot has necessary permissions

---

## 🔧 Step 1: Update Slack Bot Scopes

### Why This is Required
The complete setup script needs additional permissions to:
- Create channels (`channels:manage`)
- Join channels (`channels:join`)
- Pin messages (`pins:write`)

### Instructions

1. **Go to Slack App Settings**
   - Visit https://api.slack.com/apps
   - Select your "Support Ticket Bot" app

2. **Navigate to OAuth & Permissions**
   - Click "OAuth & Permissions" in the left sidebar
   - Scroll to "Scopes" → "Bot Token Scopes"

3. **Add These Scopes**
   Click "Add an OAuth Scope" and add:
   - ✅ `channels:manage` - Create and manage channels
   - ✅ `channels:join` - Join public channels
   - ✅ `pins:write` - Pin messages

4. **Verify All Scopes**
   Your bot should now have these scopes:
   - ✅ `chat:write` (existing)
   - ✅ `chat:write.public` (existing)
   - ✅ `commands` (existing)
   - ✅ `channels:read` (existing)
   - ✅ `groups:read` (existing)
   - ✅ `users:read` (existing)
   - ✅ `links:read` (existing)
   - ✅ `channels:manage` (NEW)
   - ✅ `channels:join` (NEW)
   - ✅ `pins:write` (NEW)

5. **Reinstall App to Workspace**
   - Scroll to top of "OAuth & Permissions" page
   - Click "Reinstall to Workspace"
   - Review permissions and click "Allow"
   - **Important**: Your bot token will remain the same, no need to update `.env`

6. **Verify Installation**
   - Check that the app is installed
   - Verify the bot appears in your workspace

---

## 🚀 Step 2: Run Complete Setup Script

After adding scopes and reinstalling:

```bash
cd c:\Dev\StrataNoble\ticket-system
npm run setup:complete
```

This will:
- ✅ Create Slack channels (#support-dslv, #support-msaudreyshouse, #support-stratanoble)
- ✅ Invite bot to each channel
- ✅ Post and pin channel rules
- ✅ Create Notion portal pages
- ✅ Update Notion client options
- ✅ Output environment variables and portal URLs

**After the script completes:**
1. Copy the environment variables to your `.env` file
2. Restart the bot (`Ctrl+C`, then `npm run dev`)

---

## 📊 Step 3: Create Notion Database Views

### Why This is Required
The Notion API does not support creating database views programmatically.

### Instructions

Open your **Client Tickets** database in Notion and create these 8 views:

---

### View 1: **Inbox**
**Purpose**: First stop for new tickets

**Configuration**:
- **Type**: Table
- **Filter**: 
  - Status = New
- **Sort**: 
  - Created time (newest first)
- **Properties to show**: All

---

### View 2: **Triage Queue**
**Purpose**: Prioritized list of work to be done

**Configuration**:
- **Type**: Table
- **Filter**: 
  - Status is New OR
  - Status is Triaged
- **Sort**: 
  1. Severity (S1 → S4)
  2. Priority Score (high → low)
- **Properties to show**: Ticket, Client, Platform, Category, Severity, Priority Score, Status, Owner

---

### View 3: **This Week**
**Purpose**: Current sprint work

**Configuration**:
- **Type**: Board (grouped by Status)
- **Filter**: 
  - Release Window = This Week AND
  - Status is not Released AND
  - Status is not Won't Do
- **Sort**: 
  - Priority Score (high → low)
- **Properties to show**: Ticket, Client, Platform, Severity, Priority Score, Owner, Due Date

---

### View 4: **Waiting on Client**
**Purpose**: Tickets blocked by client response

**Configuration**:
- **Type**: Table
- **Filter**: 
  - Status = Waiting on Client
- **Sort**: 
  - Last edited time (oldest first)
- **Properties to show**: Ticket, Client, Platform, Last edited time, Notes

---

### View 5: **Blocked**
**Purpose**: Tickets blocked by technical/external issues

**Configuration**:
- **Type**: Table
- **Filter**: 
  - Status = Blocked
- **Sort**: 
  - Created time (oldest first)
- **Properties to show**: Ticket, Client, Platform, Category, Notes, Owner

---

### View 6: **Ready for Release**
**Purpose**: Completed work ready to ship

**Configuration**:
- **Type**: Table
- **Filter**: 
  - Status = Ready for Release
- **Sort**: 
  1. Platform
  2. Created time
- **Properties to show**: Ticket, Client, Platform, Category, Owner, Notes
- **Group by**: Platform (optional)

---

### View 7: **Released (Last 14 Days)**
**Purpose**: Recently shipped features

**Configuration**:
- **Type**: Table
- **Filter**: 
  - Status = Released AND
  - Last edited time is within the past 14 days
- **Sort**: 
  - Last edited time (newest first)
- **Properties to show**: Ticket, Client, Platform, Category, Last edited time

---

### View 8: **Backlog**
**Purpose**: Future work, not scheduled

**Configuration**:
- **Type**: Table
- **Filter**: 
  - Release Window = Backlog AND
  - Status is not Released AND
  - Status is not Won't Do
- **Sort**: 
  - Priority Score (high → low)
- **Properties to show**: Ticket, Client, Platform, Category, Priority Score, Impact, Urgency, Effort

---

## 📄 Step 4: Add Linked Views to Portal Pages

### Why This is Required
Linked database views must be added manually in the Notion UI.

### Instructions

For **each portal page** (DSLV, MsAudreysHouse, StrataNoble):

1. **Open the portal page** in Notion
   - Find it in your Support Desk page
   - Example: "DSLV Support Portal"

2. **Add a linked database view**
   - Click below the "Current Tickets" heading
   - Type `/linked` and press Enter
   - Select "Create linked database"
   - Choose "Client Tickets" database

3. **Filter the view by client**
   - Click the "..." menu on the linked database
   - Select "Filter"
   - Add filter: `Client = [Client Name]`
   - Example: For DSLV portal, filter `Client = DSLV`

4. **Customize the view**
   - Hide unnecessary properties
   - Show: Ticket, Status, Platform, Category, Severity, Last edited time
   - Sort by: Status, then Last edited time

5. **Rename the view** (optional)
   - Click the view name
   - Rename to "My Tickets" or "Current Status"

6. **Repeat for each portal page**
   - DSLV Support Portal → filter `Client = DSLV`
   - MsAudreysHouse Support Portal → filter `Client = MsAudreysHouse`
   - StrataNoble Support Portal → filter `Client = StrataNoble`

---

## 🎨 Step 5: Add Status Options to Status Property

### Why This is Required
Status property options must be added manually when using the status type.

### Instructions

1. **Open Client Tickets database** in Notion

2. **Click on the Status property header**
   - This opens the property settings

3. **Add these status options** (if not already present):
   - New (blue)
   - Triaged (yellow)
   - In Progress (orange)
   - Blocked (red)
   - Waiting on Client (purple)
   - Ready for Release (green)
   - Released (gray)
   - Won't Do (brown)

4. **Set default status**
   - Set "New" as the default

5. **Save changes**

---

## ✅ Verification Checklist

After completing all manual steps:

### Slack
- [ ] Bot has all 10 required scopes
- [ ] App reinstalled to workspace
- [ ] Channels created (#support-dslv, #support-msaudreyshouse, #support-stratanoble)
- [ ] Bot is member of all channels
- [ ] Rules posted and pinned in each channel

### Notion
- [ ] 8 database views created (Inbox, Triage Queue, etc.)
- [ ] Each view has correct filters and sorts
- [ ] 3 portal pages created (DSLV, MsAudreysHouse, StrataNoble)
- [ ] Each portal has linked database view filtered by client
- [ ] Status property has all 8 status options
- [ ] Client property has all 3 client options

### Bot Configuration
- [ ] Environment variables updated with new channel IDs
- [ ] Bot restarted to pick up new config
- [ ] Test ticket created in each channel
- [ ] Tickets auto-tag with correct client

---

## 🧪 Testing

### Test 1: Create Ticket in Each Channel

**For each support channel** (#support-dslv, #support-msaudreyshouse, #support-stratanoble):

1. Post a test message
2. Use `/ticket` or message shortcut
3. Fill out the form
4. Verify:
   - ✅ Ticket created in Notion
   - ✅ Client auto-tagged correctly
   - ✅ Confirmation posted in Slack
   - ✅ Slack permalink captured

### Test 2: Verify Views

**In Notion Client Tickets database**:

1. Create test tickets with different statuses
2. Verify each view shows correct tickets:
   - Inbox shows only "New" tickets
   - Triage Queue shows "New" and "Triaged"
   - This Week shows tickets with "Release Window = This Week"
   - etc.

### Test 3: Verify Portal Pages

**For each portal page**:

1. Open the portal page
2. Verify linked database view shows only that client's tickets
3. Test the read-only sharing link
4. Verify clients can view but not edit

---

## 📝 Estimated Time

| Task | Time | Difficulty |
|------|------|------------|
| Update Slack scopes | 5 min | Easy |
| Run setup script | 2 min | Easy |
| Create 8 Notion views | 15 min | Medium |
| Add linked views to portals | 10 min | Easy |
| Add status options | 2 min | Easy |
| Testing | 10 min | Easy |
| **Total** | **~45 min** | **Medium** |

---

## 🆘 Troubleshooting

### "Insufficient permissions" when running setup script
- Verify you added all 3 new scopes
- Verify you reinstalled the app to workspace
- Check bot token is still valid in `.env`

### Views not filtering correctly
- Check filter syntax matches exactly
- Verify property names match (case-sensitive)
- Try recreating the filter

### Portal pages not showing tickets
- Verify linked database is pointing to "Client Tickets"
- Check filter is set correctly (Client = [Name])
- Verify tickets exist with that client value

### Status options not appearing
- Manually add them in the Status property settings
- Notion API doesn't support creating status options

---

## 📚 Reference

### Required Slack Scopes
```
chat:write
chat:write.public
commands
channels:read
groups:read
users:read
links:read
channels:manage  ← NEW
channels:join    ← NEW
pins:write       ← NEW
```

### Notion View Filters Quick Reference
```
Inbox:           Status = New
Triage Queue:    Status in [New, Triaged]
This Week:       Release Window = This Week AND Status not in [Released, Won't Do]
Waiting:         Status = Waiting on Client
Blocked:         Status = Blocked
Ready:           Status = Ready for Release
Released:        Status = Released AND Last edited within 14 days
Backlog:         Release Window = Backlog AND Status not in [Released, Won't Do]
```

---

## ✅ Completion

Once all steps are complete:
- ✅ Multi-client support fully configured
- ✅ All channels operational
- ✅ All views created
- ✅ Portal pages ready for clients
- ✅ System tested and verified

**Your ticket system is now production-ready! 🎉**

---

**Next**: See `DEPLOYMENT-SUCCESS.md` for operational procedures and daily workflows.
