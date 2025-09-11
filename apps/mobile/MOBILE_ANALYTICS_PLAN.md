# ACHIEVERY Mobile Analytics Dashboard Plan

## Overview

Mobile analytics need to be **instantly digestible** and **action-oriented**. Unlike web dashboards, mobile screens demand focused, contextual insights that users can consume in 10-15 seconds.

## Design Philosophy

**Glanceable Insights**: Key metrics visible without scrolling  
**Progressive Disclosure**: Tap to drill down into details  
**Actionable Data**: Every chart leads to a clear next step  
**Motivational Focus**: Data presented to encourage continued progress

## Dashboard Hierarchy

### Level 1: Dashboard Tab (Quick Overview)
- **Current streak** (days)
- **This week's progress** (actions vs. goal)
- **Phase momentum** (trending up/down/steady)
- **Latest insight** (one-liner from recent narrative)

### Level 2: Analytics Tab (Detailed Insights)
- **Weekly Progress View** (default)
- **Monthly Trends**
- **Category Breakdown**
- **Phase Analysis**

### Level 3: Drill-Down Views
- **Individual week details**
- **Category-specific analytics**
- **Comparative period analysis**

## Core Visualizations

### 1. Progress Ring (Primary KPI)
**Purpose**: Instantly show weekly action completion  
**Design**: Circular progress indicator with center text  
**Data**: Current week actions / weekly limit  
**Colors**: 
- 0-60%: Gray (#e5e7eb)
- 60-90%: Blue (#3b82f6) 
- 90-100%: Green (#10b981)
- >100%: Gold (#f59e0b)

**Example Display**:
```
    ┌─────────────┐
    │     🎯      │
    │   12 / 15   │
    │   ACTIONS   │
    │   This Week │
    └─────────────┘
```

### 2. Streak Indicator
**Purpose**: Highlight consistency motivation  
**Design**: Fire emoji + number with color coding  
**Data**: Consecutive days with at least 1 action  
**Thresholds**:
- 1-2 days: 🔥 (orange)
- 3-6 days: 🔥🔥 (orange-red)
- 7+ days: 🔥🔥🔥 (red)

### 3. Weekly Bar Chart
**Purpose**: Show action distribution across 7 days  
**Design**: Horizontal bars, one per day  
**Data**: Daily action counts for current week  
**Interaction**: Tap bar to see that day's actions

### 4. Category Pie Chart
**Purpose**: Show activity type distribution  
**Design**: 3-segment pie (Learning, Building, Connecting)  
**Colors**: Learning (blue), Building (green), Connecting (purple)  
**Data**: Percentage breakdown for selected time period

### 5. Phase Progress Timeline
**Purpose**: Track advancement through Explore → Build → Launch  
**Design**: Horizontal timeline with markers  
**Data**: Actions per phase over time  
**Visual**: Progress dots with connecting lines

### 6. Monthly Heatmap
**Purpose**: Show daily activity patterns  
**Design**: Calendar grid with intensity colors  
**Data**: Daily action counts for past 30 days  
**Colors**: No actions (gray) → High activity (dark blue)

## Screen Layouts

### Dashboard Tab Integration
```
┌─────────────────────────────────────┐
│ Welcome back, John!                 │
│ Ready to transform today's          │
│ activities?                         │
├─────────────────────────────────────┤
│        🎯 Your Dream                │
│  Start a design agency focused on   │
│  sustainable brand identity         │
│  [Explore Phase] [12 actions]       │
├─────────────────────────────────────┤
│      📊 This Week's Progress        │
│  ┌─────────────┐  ┌──────────────┐  │
│  │     🎯      │  │  🔥 Streak   │  │
│  │   12 / 15   │  │   7 Days     │  │
│  │   ACTIONS   │  │              │  │
│  └─────────────┘  └──────────────┘  │
│  ████████████░░░ 80%                │
├─────────────────────────────────────┤
│          💡 Latest Insight          │
│  This week showed strong            │
│  foundation-building momentum...    │
│  [View All Insights]                │
└─────────────────────────────────────┘
```

### Analytics Tab Layout
```
┌─────────────────────────────────────┐
│ Analytics                   [⚙️]    │
├─────────────────────────────────────┤
│ [Week] [Month] [Category] [Phase]   │
├─────────────────────────────────────┤
│         Week of Dec 30              │
│  ┌─────────────────────────────────┐ │
│  │ M ██████ 3                      │ │
│  │ T ███ 1                         │ │
│  │ W ████████████ 5                │ │
│  │ T ██████ 2                      │ │
│  │ F ███ 1                         │ │
│  │ S ████████████████ 6            │ │
│  │ S ████████ 3                    │ │
│  └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│        Category Breakdown           │
│  ┌─────────────────────────────────┐ │
│  │     Learning    Building        │ │
│  │        40%        35%           │ │
│  │           Connecting            │ │
│  │              25%                │ │
│  └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│           Insights                  │
│ • Most productive day: Saturday     │
│ • Strongest category: Learning      │
│ • Improvement opportunity: Building │
│ • Suggested focus: Create prototype │
└─────────────────────────────────────┘
```

## Data Sources & Calculations

### Primary Metrics

**Weekly Action Count**: Count of user_actions where logged_date in current week  
**Streak Days**: Consecutive days with action_count > 0  
**Phase Distribution**: Actions grouped by phase (explore/build/launch)  
**Category Distribution**: Actions grouped by category (learning/building/connecting)

### Derived Insights

**Most Productive Day**: Day of week with highest average action count  
**Trending Category**: Category with increasing week-over-week percentage  
**Phase Momentum**: Whether user is accelerating/maintaining/slowing in current phase  
**Consistency Score**: (Days with actions / Total days) * 100

### Comparison Periods

**Week over Week**: Current week vs. previous week  
**Month over Month**: Current 30 days vs. previous 30 days  
**Phase Comparison**: Current phase progress vs. previous phases

## Advanced Analytics (Growth+ Tiers)

### Pattern Recognition
- **Peak Activity Hours**: When user logs most actions
- **Category Sequences**: Common action type progressions
- **Weekly Patterns**: Which days typically have most activity
- **Seasonal Trends**: Long-term activity patterns

### Predictive Insights
- **Goal Achievement Probability**: Likelihood of hitting weekly targets
- **Phase Transition Timing**: Predicted optimal time to advance phases
- **Engagement Risk**: Early warning for activity drop-offs
- **Growth Opportunities**: Suggested areas for increased focus

### Personalized Recommendations
- **Optimal Schedule**: Best times for user to log actions
- **Category Balance**: Suggestions for well-rounded progress
- **Challenge Suggestions**: Achievable stretch goals
- **Habit Reinforcement**: Personalized streak-building strategies

## Implementation Phases

### Phase 1: Basic Visualizations (MVP)
- Progress ring for weekly actions
- Simple streak counter
- Basic weekly bar chart
- Category pie chart

### Phase 2: Enhanced Insights
- Monthly heatmap
- Phase progress timeline
- Derived insights (most productive day, etc.)
- Comparison views (week over week)

### Phase 3: Advanced Analytics
- Pattern recognition
- Predictive insights
- Personalized recommendations
- Custom date range selection

## Mobile-Specific Considerations

### Performance Optimization
- **Lazy Loading**: Load charts only when tab is active
- **Data Caching**: Cache analytics data for offline viewing
- **Progressive Enhancement**: Show basic data first, enhance with animations

### Touch Interactions
- **Tap to Drill Down**: Tap any chart element for details
- **Swipe Navigation**: Swipe between time periods
- **Pull to Refresh**: Update analytics data
- **Long Press**: Additional context menus

### Responsive Design
- **Compact Mode**: Smaller charts for phones
- **Tablet Enhancement**: Side-by-side chart layouts
- **Landscape Optimization**: Horizontal chart layouts

## User Experience Flows

### First-Time Analytics User
1. **Tutorial Overlay**: "See your progress patterns"
2. **Empty State**: "Log a few actions to see insights"
3. **First Data**: Simple celebration of initial patterns
4. **Progressive Disclosure**: Introduce advanced features over time

### Regular User Journey
1. **Quick Glance**: Dashboard progress ring and streak
2. **Weekly Review**: Sunday morning analytics check
3. **Deep Dive**: Monthly pattern analysis
4. **Goal Adjustment**: Based on insights, modify targets

### Power User Features
1. **Custom Dashboards**: Configurable metric displays
2. **Export Data**: CSV/PDF reports for coach sharing
3. **Goal Setting**: Custom targets based on historical data
4. **Integration**: Sync with external productivity tools

## Success Metrics

### Engagement Metrics
- **Analytics Tab Usage**: % of users who view analytics
- **Time Spent**: Average session duration in analytics
- **Interaction Rate**: % of users who tap charts for details
- **Return Rate**: Users who revisit analytics multiple times

### Business Impact
- **Retention Correlation**: Analytics users vs. app retention
- **Upgrade Correlation**: Analytics usage vs. subscription upgrades
- **Goal Achievement**: Users who view analytics vs. target completion
- **Coach Engagement**: Analytics → Trust Ledger sharing rates

### User Satisfaction
- **Perceived Value**: "Analytics help me stay motivated"
- **Actionability**: "I know what to do next based on insights"
- **Clarity**: "I understand my progress patterns"
- **Motivation**: "Seeing progress keeps me engaged"

This analytics strategy transforms raw activity data into motivational insights that drive continued engagement and progress toward users' dreams.