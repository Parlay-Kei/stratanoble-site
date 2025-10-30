'use client';

import { useState, useEffect } from 'react';

type Campaign = {
  id: string;
  name: string;
  campaign_type: 'internet' | 'voip' | 'security' | 'cisco';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
  total_leads: number;
  called: number;
  qualified: number;
  scheduled_start?: string;
  calling_hours: { start: string; end: string };
  created_at: string;
};

type CallResult = {
  success: boolean;
  callSid?: string;
  campaignType?: string;
  error?: string;
};

export default function ColdCallingDashboard() {
  const [activeTab, setActiveTab] = useState<'manual' | 'scheduler'>('manual');
  
  // Manual Call State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [campaignType, setCampaignType] = useState<'internet' | 'voip' | 'security' | 'cisco'>('internet');
  const [isDialing, setIsDialing] = useState(false);
  const [callResult, setCallResult] = useState<CallResult | null>(null);
  
  // Scheduler State
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showNewCampaignForm, setShowNewCampaignForm] = useState(false);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);

  // Load campaigns on mount
  useEffect(() => {
    if (activeTab === 'scheduler') {
      loadCampaigns();
    }
  }, [activeTab]);

  const loadCampaigns = async () => {
    try {
      setIsLoadingCampaigns(true);
      const response = await fetch('/api/cold-calling/campaigns');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Failed to load campaigns:', error);
      setCampaigns([]);
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  // Manual Call Handler
  const handleManualCall = async () => {
    if (!phoneNumber) {
      setCallResult({ success: false, error: 'Phone number is required' });
      return;
    }

    // Validate E.164 format
    if (!phoneNumber.match(/^\+1\d{10}$/)) {
      setCallResult({ success: false, error: 'Phone number must be in E.164 format (e.g., +17021234567)' });
      return;
    }

    setIsDialing(true);
    setCallResult(null);

    try {
      const response = await fetch('/api/voice/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          testName: `Manual Call - ${campaignType}`,
          metadata: { campaign_type: campaignType },
        }),
      });

      const data = await response.json();
      setCallResult(data);

      if (data.success) {
        // Clear form after successful call
        setTimeout(() => {
          setPhoneNumber('');
          setCallResult(null);
        }, 5000);
      }
    } catch (error) {
      setCallResult({ success: false, error: 'Failed to initiate call' });
    } finally {
      setIsDialing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Cold Calling Agent Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage manual calls and automated campaigns with Jake, your AI calling agent
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('manual')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'manual'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📞 Manual Calling
            </button>
            <button
              onClick={() => setActiveTab('scheduler')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'scheduler'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📅 Campaign Scheduler
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'manual' ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <span className="text-3xl">📞</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Make a Call Now</h2>
                <p className="mt-2 text-gray-600">
                  Push the button to initiate an immediate call with Jake
                </p>
              </div>

              {/* Phone Number Input */}
              <div className="mb-6">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+17021234567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isDialing}
                />
                <p className="mt-1 text-xs text-gray-500">Format: +1 followed by 10 digits</p>
              </div>

              {/* Campaign Type Selection */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Campaign Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: 'internet', label: 'Internet Services', icon: '🌐', desc: 'Speed & reliability' },
                    { value: 'voip', label: 'VoIP Solutions', icon: '📱', desc: 'Phone systems' },
                    { value: 'security', label: 'Security Systems', icon: '🔒', desc: 'Business protection' },
                    { value: 'cisco', label: 'Cisco Networking', icon: '🔧', desc: 'Infrastructure' },
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setCampaignType(type.value as any)}
                      disabled={isDialing}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        campaignType === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${isDialing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2">{type.icon}</span>
                        <span className="font-medium text-gray-900">{type.label}</span>
                      </div>
                      <p className="text-xs text-gray-600">{type.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Call Button - THE PUSH BUTTON! */}
              <button
                onClick={handleManualCall}
                disabled={isDialing || !phoneNumber}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
                  isDialing || !phoneNumber
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-lg hover:shadow-xl'
                }`}
              >
                {isDialing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Calling...
                  </span>
                ) : (
                  '📞 CALL NOW'
                )}
              </button>

              {/* Call Result */}
              {callResult && (
                <div
                  className={`mt-6 p-4 rounded-lg ${
                    callResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}
                >
                  {callResult.success ? (
                    <div>
                      <div className="flex items-center mb-2">
                        <span className="text-green-600 font-semibold">✅ Call Initiated!</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Jake is calling <strong>{phoneNumber}</strong> with the <strong>{callResult.campaignType}</strong> script.
                      </p>
                      <p className="text-xs text-green-600 mt-2">Call SID: {callResult.callSid}</p>
                      <p className="text-xs text-green-600 mt-1">Phone will ring in 5-10 seconds.</p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center mb-2">
                        <span className="text-red-600 font-semibold">❌ Call Failed</span>
                      </div>
                      <p className="text-sm text-red-700">{callResult.error}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Help Text */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">💡 How it works:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>1. Enter prospect phone number</li>
                  <li>2. Select campaign type</li>
                  <li>3. Click "CALL NOW" button</li>
                  <li>4. Jake calls and qualifies the lead</li>
                  <li>5. Results tracked automatically</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Scheduler Section Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Automated Campaigns</h2>
                <p className="text-gray-600 mt-1">Schedule bulk calling campaigns to run automatically</p>
              </div>
              <button
                onClick={() => setShowNewCampaignForm(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                + New Campaign
              </button>
            </div>

            {/* New Campaign Form Placeholder */}
            {showNewCampaignForm && (
              <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
                <h3 className="text-xl font-bold mb-4">Create New Campaign</h3>
                <p className="text-gray-600 mb-4">
                  Campaign scheduler coming soon. Use the <button onClick={() => setActiveTab('manual')} className="text-blue-600 underline">Manual Calling</button> tab for immediate calls.
                </p>
                <button
                  onClick={() => setShowNewCampaignForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            )}

            {/* Campaigns List */}
            {isLoadingCampaigns ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading campaigns...</p>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <span className="text-6xl mb-4 block">📅</span>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Campaigns Yet</h3>
                <p className="text-gray-600 mb-6">
                  The automated scheduler will allow you to run campaigns with multiple leads.
                  For now, use the Manual Calling tab to make immediate calls.
                </p>
                <button
                  onClick={() => setActiveTab('manual')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Make a Manual Call
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="bg-white rounded-lg shadow p-6">
                    <h3 className="font-semibold text-lg">{campaign.name}</h3>
                    <p className="text-sm text-gray-600">{campaign.campaign_type}</p>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm">
                        <span>Progress:</span>
                        <span>{campaign.called}/{campaign.total_leads}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(campaign.called / campaign.total_leads) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
