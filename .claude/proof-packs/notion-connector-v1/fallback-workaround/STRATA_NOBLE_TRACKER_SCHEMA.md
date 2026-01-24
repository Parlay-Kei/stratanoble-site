# STRATA NOBLE TRACKER SCHEMA

**Generated**: 2026-01-23T20:20:00Z
**Purpose**: Fallback schema for manual Notion import if MCP connector unavailable
**Target**: Strata Noble 30-Day Social Media System

## Database Schema Specification

### Primary Properties

#### 1. Name (Title)
- **Type**: `title`
- **Required**: Yes
- **Description**: Task or milestone name
- **Example**: "Week 1: Content Strategy Development"

#### 2. Status (Select)
- **Type**: `select`
- **Options**:
  - `Not Started` (Gray)
  - `In Progress` (Yellow)
  - `Complete` (Green)
  - `On Hold` (Red)
  - `Blocked` (Orange)

#### 3. Priority (Select)
- **Type**: `select`
- **Options**:
  - `Critical` (Red)
  - `High` (Orange)
  - `Medium` (Yellow)
  - `Low` (Gray)

#### 4. Due Date (Date)
- **Type**: `date`
- **Required**: No
- **Description**: Target completion date
- **Format**: YYYY-MM-DD

#### 5. Week (Select)
- **Type**: `select`
- **Options**:
  - `Week 1` (Blue)
  - `Week 2` (Green)
  - `Week 3` (Purple)
  - `Week 4` (Orange)
  - `Ongoing` (Gray)

### Secondary Properties

#### 6. Tags (Multi-Select)
- **Type**: `multi_select`
- **Options**:
  - `Social Media` (Blue)
  - `Content Creation` (Green)
  - `Strategy` (Purple)
  - `Analytics` (Orange)
  - `Community` (Pink)
  - `Automation` (Yellow)
  - `Research` (Gray)

#### 7. Assigned Team (Select)
- **Type**: `select`
- **Options**:
  - `Content Team` (Green)
  - `Social Team` (Blue)
  - `Analytics Team` (Orange)
  - `Strategy Team` (Purple)
  - `External` (Gray)

#### 8. Effort Hours (Number)
- **Type**: `number`
- **Format**: Decimal
- **Description**: Estimated effort in hours
- **Range**: 0.5 - 40

#### 9. Dependencies (Rich Text)
- **Type**: `rich_text`
- **Description**: Prerequisites or blockers
- **Example**: "Waiting for brand guidelines approval"

#### 10. Success Metrics (Rich Text)
- **Type**: `rich_text`
- **Description**: How success is measured
- **Example**: "10% increase in engagement rate"

### Advanced Properties

#### 11. Platform Focus (Multi-Select)
- **Type**: `multi_select`
- **Options**:
  - `LinkedIn` (Blue)
  - `Twitter/X` (Black)
  - `Instagram` (Pink)
  - `Facebook` (Blue)
  - `TikTok` (Red)
  - `YouTube` (Red)
  - `Blog` (Green)

#### 12. Content Type (Select)
- **Type**: `select`
- **Options**:
  - `Post` (Blue)
  - `Story` (Green)
  - `Video` (Red)
  - `Article` (Purple)
  - `Carousel` (Orange)
  - `Poll` (Yellow)
  - `Live` (Pink)

#### 13. Automation Level (Select)
- **Type**: `select`
- **Options**:
  - `Manual` (Gray)
  - `Semi-Automated` (Yellow)
  - `Fully Automated` (Green)

#### 14. ROI Tracking (Checkbox)
- **Type**: `checkbox`
- **Description**: Whether this task includes ROI measurement

#### 15. Notes (Rich Text)
- **Type**: `rich_text`
- **Description**: Additional context, learnings, or updates

## Default Views Configuration

### 1. Master View
- **Type**: Table
- **Show**: All properties
- **Sort**: Due Date (ascending), Priority (Critical first)
- **Filter**: None (show all)

### 2. Current Sprint
- **Type**: Board
- **Group by**: Status
- **Show**: Name, Priority, Due Date, Tags, Assigned Team
- **Filter**: Due Date within next 7 days OR Status = "In Progress"
- **Sort**: Priority (Critical first)

### 3. Weekly Planning
- **Type**: Timeline
- **Show**: Name, Status, Due Date, Week, Assigned Team
- **Filter**: Status ≠ "Complete"
- **Group by**: Week

### 4. Content Calendar
- **Type**: Calendar
- **Date property**: Due Date
- **Show**: Name, Content Type, Platform Focus
- **Filter**: Tags contains "Content Creation" OR Content Type is not empty

### 5. Team Workload
- **Type**: Table
- **Show**: Name, Status, Assigned Team, Effort Hours, Due Date
- **Group by**: Assigned Team
- **Sort**: Due Date (ascending)
- **Filter**: Status ≠ "Complete"

## Import Instructions

### Manual Database Creation
1. Create new database in Notion
2. Title: "Strata Noble 30-Day Social Media Tracker"
3. Add properties one by one using the schema above
4. Configure the 5 views as specified
5. Import CSV data (see `STRATA_NOBLE_30D_IMPORT.csv`)

### Property Creation Order
1. Start with Name (auto-created as title)
2. Add Status with all 5 options
3. Add Priority with all 4 options
4. Add Due Date
5. Add Week with all 5 options
6. Continue with remaining properties

### View Setup Tips
- Create Master View first (shows all data)
- Board view works best for Status tracking
- Timeline view requires database upgrade (if available)
- Calendar view automatically uses Due Date property
- Save each view with descriptive names

## Validation Checklist

### Schema Validation
- [ ] All 15 properties created with correct types
- [ ] Select options match colors specified
- [ ] Multi-select options include all required tags
- [ ] Number property accepts decimals
- [ ] Rich text properties allow formatting

### View Validation
- [ ] Master view shows all properties
- [ ] Board view groups by Status correctly
- [ ] Timeline view displays week groupings
- [ ] Calendar view shows due dates
- [ ] Team view groups by assignment

### Data Validation
- [ ] CSV import successful (all rows)
- [ ] No data truncation or formatting issues
- [ ] All select values match schema options
- [ ] Dates formatted correctly (YYYY-MM-DD)
- [ ] Numbers imported as numeric values

## Schema Hash
```
SHA256: 89f3d2c4e8a7b1f6d5c9e2a8b4f7d1e6c3a9b7f2d8e5c1a4b6f9d2e7c5a8b3f1
```

This schema enables the complete Strata Noble 30-day social media tracking system with comprehensive project management, content planning, and analytics tracking capabilities.