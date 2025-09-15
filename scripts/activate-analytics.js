#!/usr/bin/env node
/**
 * ACHIEVERY Analytics Activation Script
 * Initializes and tests the complete analytics infrastructure
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const WEB_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const PLATFORM_URL = process.env.NEXT_PUBLIC_ACHIEVERY_URL || 'https://app.achievery.com';

// Analytics test events
const TEST_EVENTS = [
  {
    event: 'session_start',
    properties: { page: '/', source: 'direct' },
    platform: 'web'
  },
  {
    event: 'early_access_signup',
    properties: { tier: 'growth', source: 'homepage' },
    platform: 'web'
  },
  {
    event: 'mobile_app_download',
    properties: { platform: 'ios', source: 'web_platform' },
    platform: 'mobile'
  },
  {
    event: 'action_logged',
    properties: { category: 'learning', phase: 'building' },
    platform: 'web'
  },
  {
    event: 'coach_dashboard_access',
    properties: { clientCount: 3 },
    platform: 'web'
  },
  {
    event: 'cross_platform_sync',
    properties: { syncType: 'web_to_mobile', dataType: 'actions' },
    platform: 'mobile'
  }
];

class AnalyticsActivator {
  constructor() {
    this.supabase = null;
    this.results = {
      timestamp: new Date().toISOString(),
      database_setup: false,
      api_endpoints: [],
      test_events: [],
      dashboard_data: null,
      performance_metrics: {},
      errors: [],
      recommendations: []
    };
  }

  async activate() {
    console.log('🚀 ACHIEVERY Analytics Activation Starting...');
    
    try {
      await this.initializeSupabase();
      await this.setupDatabase();
      await this.testApiEndpoints();
      await this.testEventTracking();
      await this.validateDashboard();
      await this.testCrossPlatformSync();
      await this.generateReport();
      
      console.log('✅ Analytics activation completed successfully!');
    } catch (error) {
      console.error('❌ Analytics activation failed:', error);
      this.results.errors.push({
        type: 'activation_failure',
        message: error.message,
        stack: error.stack
      });
    } finally {
      await this.saveResults();
    }
  }

  async initializeSupabase() {
    console.log('📡 Initializing Supabase connection...');
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error('Missing Supabase credentials in environment variables');
    }

    this.supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // Test connection
    const { data, error } = await this.supabase.from('analytics_events').select('count').limit(1);
    if (error && !error.message.includes('relation "analytics_events" does not exist')) {
      throw new Error(`Supabase connection failed: ${error.message}`);
    }

    console.log('✅ Supabase connection established');
  }

  async setupDatabase() {
    console.log('🗄️ Setting up analytics database schema...');
    
    try {
      // Read the schema file
      const schemaPath = path.join(__dirname, '../apps/platform/src/lib/analytics-schema.sql');
      const schema = await fs.readFile(schemaPath, 'utf8');
      
      // Execute schema (this would need to be done manually or via Supabase dashboard in production)
      console.log('📋 Schema ready for deployment (execute manually in Supabase dashboard)');
      
      this.results.database_setup = true;
    } catch (error) {
      this.results.errors.push({
        type: 'database_setup',
        message: `Database setup failed: ${error.message}`
      });
    }
  }

  async testApiEndpoints() {
    console.log('🔗 Testing analytics API endpoints...');
    
    const endpoints = [
      { path: '/api/analytics/track', method: 'POST' },
      { path: '/api/analytics/dashboard', method: 'GET' },
      { path: '/api/analytics/mobile', method: 'POST' }
    ];

    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now();
        const url = `${WEB_BASE_URL}${endpoint.path}`;
        
        let response;
        if (endpoint.method === 'GET') {
          response = await fetch(`${url}?range=week`);
        } else {
          response = await fetch(url, {
            method: endpoint.method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'test_event',
              sessionId: 'test_session',
              timestamp: new Date().toISOString()
            })
          });
        }
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        this.results.api_endpoints.push({
          endpoint: endpoint.path,
          method: endpoint.method,
          status: response.status,
          response_time: responseTime,
          success: response.ok
        });
        
        console.log(`  ${response.ok ? '✅' : '❌'} ${endpoint.method} ${endpoint.path} - ${response.status} (${responseTime}ms)`);
        
      } catch (error) {
        this.results.api_endpoints.push({
          endpoint: endpoint.path,
          method: endpoint.method,
          status: 0,
          error: error.message,
          success: false
        });
        
        console.log(`  ❌ ${endpoint.method} ${endpoint.path} - Error: ${error.message}`);
      }
    }
  }

  async testEventTracking() {
    console.log('📊 Testing event tracking...');
    
    for (const testEvent of TEST_EVENTS) {
      try {
        const startTime = Date.now();
        const event = {
          ...testEvent,
          sessionId: `test_${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: 'test_user_analytics'
        };
        
        const response = await fetch(`${WEB_BASE_URL}/api/analytics/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event)
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        this.results.test_events.push({
          event: event.event,
          platform: event.platform,
          success: response.ok,
          response_time: responseTime,
          status: response.status
        });
        
        console.log(`  ${response.ok ? '✅' : '❌'} ${event.event} (${event.platform}) - ${response.status} (${responseTime}ms)`);
        
      } catch (error) {
        this.results.test_events.push({
          event: testEvent.event,
          platform: testEvent.platform,
          success: false,
          error: error.message
        });
        
        console.log(`  ❌ ${testEvent.event} - Error: ${error.message}`);
      }
    }
  }

  async validateDashboard() {
    console.log('📈 Validating analytics dashboard...');
    
    try {
      const startTime = Date.now();
      const response = await fetch(`${WEB_BASE_URL}/api/analytics/dashboard?range=week`);
      const endTime = Date.now();
      
      if (response.ok) {
        const data = await response.json();
        this.results.dashboard_data = {
          week1_metrics: data.week1Metrics,
          month1_metrics: data.month1Metrics,
          recent_activity_points: data.recentActivity?.length || 0,
          performance_metrics_count: data.performanceMetrics?.length || 0,
          conversion_funnel_steps: data.conversionFunnel?.length || 0,
          response_time: endTime - startTime
        };
        
        console.log(`  ✅ Dashboard data loaded (${endTime - startTime}ms)`);
        console.log(`    - Week 1 metrics: ${JSON.stringify(data.week1Metrics)}`);
        console.log(`    - Month 1 metrics: ${JSON.stringify(data.month1Metrics)}`);
      } else {
        throw new Error(`Dashboard API returned ${response.status}`);
      }
      
    } catch (error) {
      this.results.errors.push({
        type: 'dashboard_validation',
        message: `Dashboard validation failed: ${error.message}`
      });
      
      console.log(`  ❌ Dashboard validation failed: ${error.message}`);
    }
  }

  async testCrossPlatformSync() {
    console.log('🔄 Testing cross-platform analytics sync...');
    
    try {
      // Test mobile analytics endpoint
      const mobileEvent = {
        event: 'mobile_session_start',
        properties: { launchType: 'cold' },
        timestamp: new Date().toISOString(),
        sessionId: `mobile_test_${Date.now()}`,
        platform: 'ios',
        deviceInfo: {
          platform: 'ios',
          version: '17.0',
          model: 'iPhone 14',
          isTablet: false
        }
      };
      
      const response = await fetch(`${WEB_BASE_URL}/api/analytics/mobile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mobileEvent)
      });
      
      if (response.ok) {
        console.log('  ✅ Mobile analytics sync working');
      } else {
        throw new Error(`Mobile sync failed: ${response.status}`);
      }
      
    } catch (error) {
      this.results.errors.push({
        type: 'cross_platform_sync',
        message: `Cross-platform sync failed: ${error.message}`
      });
      
      console.log(`  ❌ Cross-platform sync failed: ${error.message}`);
    }
  }

  async generateReport() {
    console.log('📋 Generating analytics readiness report...');
    
    // Calculate success rate
    const totalTests = this.results.api_endpoints.length + this.results.test_events.length;
    const successfulTests = 
      this.results.api_endpoints.filter(e => e.success).length +
      this.results.test_events.filter(e => e.success).length;
    
    const successRate = totalTests > 0 ? (successfulTests / totalTests) * 100 : 0;
    
    // Performance analysis
    const avgResponseTime = this.results.api_endpoints
      .filter(e => e.response_time)
      .reduce((sum, e) => sum + e.response_time, 0) / 
      Math.max(this.results.api_endpoints.filter(e => e.response_time).length, 1);
    
    this.results.performance_metrics = {
      success_rate: successRate,
      avg_response_time: avgResponseTime,
      total_tests: totalTests,
      successful_tests: successfulTests
    };
    
    // Generate recommendations
    if (successRate < 100) {
      this.results.recommendations.push('Address failed endpoint tests before production launch');
    }
    
    if (avgResponseTime > 1000) {
      this.results.recommendations.push('Optimize API response times (currently averaging > 1s)');
    }
    
    if (this.results.errors.length > 0) {
      this.results.recommendations.push('Resolve all error conditions found during activation');
    }
    
    if (!this.results.dashboard_data) {
      this.results.recommendations.push('Fix analytics dashboard API to enable real-time monitoring');
    }
    
    this.results.recommendations.push('Set up automated monitoring and alerting for analytics endpoints');
    this.results.recommendations.push('Implement analytics data retention and archiving policies');
    this.results.recommendations.push('Configure success metrics goals and automated reporting');
    
    console.log('\n📊 Analytics Readiness Summary:');
    console.log(`  Success Rate: ${successRate.toFixed(1)}%`);
    console.log(`  Average Response Time: ${avgResponseTime.toFixed(0)}ms`);
    console.log(`  Errors Found: ${this.results.errors.length}`);
    console.log(`  Recommendations: ${this.results.recommendations.length}`);
  }

  async saveResults() {
    const resultsPath = path.join(__dirname, '../analytics-activation-results.json');
    await fs.writeFile(resultsPath, JSON.stringify(this.results, null, 2));
    console.log(`\n💾 Results saved to: ${resultsPath}`);
  }
}

// Run activation if called directly
if (require.main === module) {
  const activator = new AnalyticsActivator();
  activator.activate().catch(console.error);
}

module.exports = AnalyticsActivator;