# 🎉 Multi-Client Setup - ALMOST COMPLETE!

## ✅ What's Been Done

### Slack Channels ✅
- ✅ `#support-dslv` created (C0A833HKC5T)
- ✅ `#support-msaudreyshouse` created (C0A80521RGT)
- ✅ Bot joined both channels
- ✅ Rules posted and pinned in both channels

### Notion ✅
- ✅ **DSLV Portal** created: https://www.notion.so/DSLV-Support-Portal-2e613b428aa7812183dfd976980e1202
- ✅ **MsAudreysHouse Portal** created: https://www.notion.so/MsAudreysHouse-Support-Portal-2e613b428aa781cab55dcba0a65bcd57
- ✅ Client property updated with DSLV and MsAudreysHouse options

---

## 📋 Remaining Steps (Quick!)

### Step 1: Update .env File (2 min)

Add these lines to `c:\Dev\StrataNoble\ticket-system\.env`:

```env
# Multi-Client Support Channels
SLACK_SUPPORT_CHANNEL_DSLV=C0A833HKC5T
SLACK_SUPPORT_CHANNEL_MSAUDREYSHOUSE=C0A80521RGT
```

### Step 2: Restart Bot (1 min)

In the terminal where the bot is running:
1. Press `Ctrl+C` to stop
2. Run: `npm run dev`

### Step 3: Add Linked Views to Portal Pages (10 min)

**DSLV Portal**:
1. Open: https://www.notion.so/DSLV-Support-Portal-2e613b428aa7812183dfd976980e1202
2. Click below "Current Tickets" heading
3. Type `/linked` and press Enter
4. Select "Create linked database"
5. Choose "Client Tickets"
6. Click the "..." menu on the linked database
7. Select "Filter"
8. Add filter: `Client = DSLV`
9. Customize visible properties (show: Ticket, Status, Platform, Category, Severity, Last edited)

**MsAudreysHouse Portal**:
1. Open: https://www.notion.so/MsAudreysHouse-Support-Portal-2e613b428aa781cab55dcba0a65bcd57
2. Repeat same steps as above
3. Filter: `Client = MsAudreysHouse`

### Step 4: Create Notion Database Views (15 min)

In your **Client Tickets** database, create these 8 views:

1. **Inbox**
   - Filter: `Status = New`
   - Sort: Created time (newest first)

2. **Triage Queue**
   - Filter: `Status is New OR Status is Triaged`
   - Sort: Severity (S1→S4), then Priority Score (high→low)

3. **This Week**
   - Type: Board (grouped by Status)
   - Filter: `Release Window = This Week AND Status not in [Released, Won't Do]`

4. **Waiting on Client**
   - Filter: `Status = Waiting on Client`
   - Sort: Last edited (oldest first)

5. **Blocked**
   - Filter: `Status = Blocked`

6. **Ready for Release**
   - Filter: `Status = Ready for Release`

7. **Released (Last 14 Days)**
   - Filter: `Status = Released AND Last edited within 14 days`

8. **Backlog**
   - Filter: `Release Window = Backlog AND Status not in [Released, Won't Do]`

See `MANUAL-SETUP-STEPS.md` for detailed configurations.

### Step 5: Add Status Options (2 min)

In Notion Client Tickets database:
1. Click the "Status" property header
2. Add these status options:
   - New (blue)
   - Triaged (yellow)
   - In Progress (orange)
   - Blocked (red)
   - Waiting on Client (purple)
   - Ready for Release (green)
   - Released (gray)
   - Won't Do (brown)

### Step 6: Test Everything (10 min)

**Test DSLV Channel**:
1. Go to Slack `#support-dslv`
2. Post: "Test: login button not working"
3. Use `/ticket` to create a ticket
4. Verify:
   - ✅ Ticket created in Notion
   - ✅ Client auto-tagged as "DSLV"
   - ✅ Confirmation posted in Slack
   - ✅ Appears in DSLV Portal

**Test MsAudreysHouse Channel**:
1. Go to Slack `#support-msaudreyshouse`
2. Post: "Test: checkout issue"
3. Use `/ticket` to create a ticket
4. Verify:
   - ✅ Ticket created in Notion
   - ✅ Client auto-tagged as "MsAudreysHouse"
   - ✅ Confirmation posted in Slack
   - ✅ Appears in MsAudreysHouse Portal

---

## 📊 Progress Tracker

| Task | Status | Time |
|------|--------|------|
| Slack channels created | ✅ Done | - |
| Rules posted and pinned | ✅ Done | - |
| Notion portals created | ✅ Done | - |
| Client options updated | ✅ Done | - |
| **Update .env** | ⏳ To Do | 2 min |
| **Restart bot** | ⏳ To Do | 1 min |
| **Add linked views** | ⏳ To Do | 10 min |
| **Create 8 database views** | ⏳ To Do | 15 min |
| **Add status options** | ⏳ To Do | 2 min |
| **Test both channels** | ⏳ To Do | 10 min |
| **Total Remaining** | **5/10** | **~40 min** |

---

## 🎯 Quick Start Checklist

- [ ] Add environment variables to `.env`
- [ ] Restart bot (`Ctrl+C`, then `npm run dev`)
- [ ] Add linked view to DSLV Portal (filter: Client = DSLV)
- [ ] Add linked view to MsAudreysHouse Portal (filter: Client = MsAudreysHouse)
- [ ] Create 8 database views (Inbox, Triage Queue, etc.)
- [ ] Add 8 status options to Status property
- [ ] Test ticket creation in `#support-dslv`
- [ ] Test ticket creation in `#support-msaudreyshouse`
- [ ] Share portal URLs with clients
- [ ] Celebrate! 🎉

---

## 📚 Resources

- **Detailed Instructions**: `MANUAL-SETUP-STEPS.md`
- **Quick Reference**: `QUICK-REFERENCE.md`
- **Operations Guide**: `docs/runbook.md`

---

## 🔗 Important Links

**Slack Channels**:
- DSLV: https://app.slack.com/client/.../C0A833HKC5T
- MsAudreysHouse: https://app.slack.com/client/.../C0A80521RGT

**Notion Portals** (share with clients):
- DSLV: https://www.notion.so/DSLV-Support-Portal-2e613b428aa7812183dfd976980e1202
- MsAudreysHouse: https://www.notion.so/MsAudreysHouse-Support-Portal-2e613b428aa781cab55dcba0a65bcd57

**Notion Database**:
- Client Tickets: Database ID `2e613b42-8aa7-813d-81d6-cd4e0f8377a7`

---

## ✅ When Complete

You'll have:
- ✅ 2 dedicated support channels (one per client)
- ✅ 2 client portal pages (read-only status views)
- ✅ 8 workflow views (Inbox, Triage, etc.)
- ✅ Auto-tagging by client
- ✅ Professional channel rules
- ✅ Full multi-client support system

**Estimated remaining time**: ~40 minutes

---

**Start with Step 1: Update .env file!**
