'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

interface SubscriptionManagerProps {
  customerId?: string;
  currentPlan?: string;
  subscriptionStatus?: string;
}

export default function SubscriptionManager({ 
  customerId, 
  currentPlan = 'none',
  subscriptionStatus = 'inactive'
}: SubscriptionManagerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleManageSubscription = async () => {
    if (!customerId) {
      showToast({
        type: 'warning',
        title: 'Missing Customer ID',
        message: 'No customer ID found. Please contact support.'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          returnUrl: window.location.href
        }),
      });

      const result = await response.json();

      if (response.ok && result.url) {
        window.location.href = result.url;
      } else {
        showToast({
          type: 'error',
          title: 'Subscription Management Error',
          message: result.error || 'Error opening subscription management. Please try again.'
        });
      }
    } catch {
      showToast({
        type: 'error',
        title: 'Network Error',
        message: 'Unable to connect to subscription service. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400';
      case 'past_due':
        return 'text-yellow-400';
      case 'canceled':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'past_due':
        return 'Past Due';
      case 'canceled':
        return 'Canceled';
      case 'trialing':
        return 'Trial';
      default:
        return 'Inactive';
    }
  };

  const getPlanDisplayName = (plan: string) => {
    switch (plan) {
      case 'lite':
        return 'Dashboard Lite';
      case 'growth':
        return 'Growth Blueprint';
      case 'partner':
        return 'Revenue Partner';
      default:
        return 'No Plan';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <h3 className="text-lg font-semibold text-white mb-4">
        Subscription Management
      </h3>
      
      <div className="space-y-4">
        {/* Current Plan */}
        <div className="flex justify-between items-center">
          <span className="text-[#C0C0C0]">Current Plan:</span>
          <span className="text-white font-semibold">
            {getPlanDisplayName(currentPlan)}
          </span>
        </div>

        {/* Status */}
        <div className="flex justify-between items-center">
          <span className="text-[#C0C0C0]">Status:</span>
          <span className={`font-semibold ${getStatusColor(subscriptionStatus)}`}>
            {getStatusText(subscriptionStatus)}
          </span>
        </div>

        {/* Management Button */}
        <div className="pt-4">
          {customerId ? (
            <Button
              onClick={handleManageSubscription}
              disabled={isLoading}
              className="w-full bg-[#50C878] hover:bg-[#3DB067] text-white"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Opening portal...
                </div>
              ) : (
                'Manage Subscription'
              )}
            </Button>
          ) : (
            <div className="text-center">
              <p className="text-[#C0C0C0] text-sm mb-3">
                No active subscription found
              </p>
              <Button
                onClick={() => window.location.href = '/pricing'}
                className="w-full bg-[#50C878] hover:bg-[#3DB067] text-white"
              >
                View Plans
              </Button>
            </div>
          )}
        </div>

        {/* Additional Info */}
        {subscriptionStatus === 'past_due' && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 mt-4">
            <p className="text-yellow-200 text-sm">
              Your payment is past due. Please update your payment method to continue using the service.
            </p>
          </div>
        )}

        {subscriptionStatus === 'canceled' && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mt-4">
            <p className="text-red-200 text-sm">
              Your subscription has been canceled. You can reactivate it anytime.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
