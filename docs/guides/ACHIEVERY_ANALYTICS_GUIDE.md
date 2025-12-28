# ACHIEVERY Analytics Integration Guide

This guide explains how to use the GA4 analytics tracking system for the ACHIEVERY mobile app with tracking ID: `G-0TGKD1S1HB`.

## Overview

The analytics system provides comprehensive event tracking for ACHIEVERY app interactions, including:
- Goal creation and completion
- Progress updates
- Milestone achievements
- Feature usage
- User retention metrics
- Subscription events

## Files Created

### 1. `src/lib/analytics.ts`
Core analytics library with GA4 integration:
- `Analytics` class for event tracking
- Pre-defined ACHIEVERY event methods
- Measurement Protocol integration (ready for production)

### 2. `src/hooks/useAnalytics.ts`
React hook for easy component integration:
- Automatic initialization
- Callback-based event tracking functions
- Error handling

### 3. `src/components/ExampleAnalyticsUsage.tsx`
Example component showing implementation patterns

## Usage Examples

### Basic Setup in a Component

```tsx
import { useAnalytics } from '../hooks/useAnalytics';

export const MyComponent = () => {
  const { trackScreenView, trackButtonPress, trackGoalCreated } = useAnalytics();

  useEffect(() => {
    trackScreenView('MyScreen');
  }, []);

  const handleCreateGoal = async () => {
    await trackButtonPress('create_goal_button', 'MyScreen');
    await trackGoalCreated('fitness', 'high');
    // Your goal creation logic
  };

  return (
    <TouchableOpacity onPress={handleCreateGoal}>
      <Text>Create Goal</Text>
    </TouchableOpacity>
  );
};
```

### Custom Event Tracking

```tsx
const { trackEvent } = useAnalytics();

// Track custom ACHIEVERY action
await trackEvent('custom_achievery_action', {
  event_category: 'engagement',
  event_label: 'specific_action',
  value: 1,
  custom_parameter: 'additional_data'
});
```

## Available Tracking Methods

### Screen & Interaction Tracking
- `trackScreenView(screenName)` - Track screen visits
- `trackButtonPress(buttonName, screenName?)` - Track button interactions

### ACHIEVERY-Specific Events
- `trackGoalCreated(goalType, priority)` - Track goal creation
- `trackGoalCompleted(goalId, timeToComplete)` - Track goal completion
- `trackProgressUpdate(percentage)` - Track progress updates
- `trackMilestone(milestoneType)` - Track milestone achievements
- `trackFeatureUsage(featureName)` - Track feature usage
- `trackUserRetention(daysActive)` - Track user retention
- `trackSubscription(eventType, tier)` - Track subscription events

### Generic Event Tracking
- `trackEvent(action, params)` - Track custom events

## Event Categories

Events are automatically categorized for better analytics organization:

- **engagement** - General user interactions
- **goal_management** - Goal creation and management
- **achievement** - Goal completions and milestones
- **feature_engagement** - Feature usage tracking
- **retention** - User retention metrics
- **monetization** - Subscription and payment events
- **navigation** - Screen views and navigation
- **user_interaction** - Button presses and UI interactions

## Production Setup

For production deployment, you'll need to:

1. **Get GA4 API Secret**: Create an API secret in your GA4 property settings
2. **Update the analytics library**: Uncomment and configure the Measurement Protocol code in `sendEvent()` method
3. **Add environment variables**: Store the API secret securely
4. **Implement client ID storage**: Use AsyncStorage or SecureStore for persistent client IDs

### Production Code Example

```typescript
// In production, replace the console.log with actual API call:
const response = await fetch(
  `https://www.google-analytics.com/mp/collect?measurement_id=${this.trackingId}&api_secret=${API_SECRET}`,
  {
    method: 'POST',
    body: JSON.stringify({
      client_id: await this.getClientId(),
      events: [{
        name: eventName,
        params: parameters
      }]
    })
  }
);
```

## Event Data Structure

All ACHIEVERY events follow this structure:

```typescript
{
  event_name: 'achievery_action',
  event_category: 'engagement' | 'goal_management' | 'achievement' | etc.,
  event_label: 'specific_action_description',
  value: number,
  custom_parameter?: string,
  timestamp: ISO_string
}
```

## Testing

During development, all events are logged to the console with this format:

```
GA4 Event Tracked: {
  event: 'achievery_action',
  parameters: { ... },
  timestamp: '2025-01-11T14:27:00.000Z'
}
```

## Integration Checklist

- [ ] Import `useAnalytics` hook in your components
- [ ] Add screen view tracking to main screens
- [ ] Add button press tracking to important interactions
- [ ] Implement goal-specific event tracking
- [ ] Add progress and milestone tracking
- [ ] Set up subscription event tracking
- [ ] Test events in development (check console logs)
- [ ] Configure production API secret
- [ ] Deploy and verify events in GA4 dashboard

## Best Practices

1. **Track meaningful interactions** - Focus on events that provide business value
2. **Use consistent naming** - Follow the established event naming conventions
3. **Include context** - Use custom parameters to provide additional context
4. **Handle errors gracefully** - The hook includes error handling, but monitor for issues
5. **Respect user privacy** - Ensure compliance with privacy regulations
6. **Test thoroughly** - Verify events are firing correctly before production deployment

## Support

For questions about the analytics implementation, refer to:
- GA4 Measurement Protocol documentation
- React Native analytics best practices
- ACHIEVERY app-specific tracking requirements
