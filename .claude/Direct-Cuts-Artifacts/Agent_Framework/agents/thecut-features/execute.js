#!/usr/bin/env node

/**
 * TheCut Features Implementation Agent
 * 
 * Executes all 5 competitor-inspired features with Direct Cuts improvements.
 * Includes unit economics tracking and real-time performance metrics.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONFIG = require('./agent-config.json');
const PROJECT_ROOT = path.join(__dirname, '../..');

// Color output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  log(`\n${'='.repeat(60)}`, 'bright');
  log(title.toUpperCase(), 'bright');
  log('='.repeat(60) + '\n', 'bright');
}

// ============================================================
// PHASE 1: DATABASE MIGRATIONS
// ============================================================

function createDatabaseMigrations() {
  section('Phase 1: Creating Database Migrations');
  
  const migrations = [
    {
      name: '001_barber_stats_materialized_view',
      content: `
-- Materialized view for barber daily statistics
CREATE MATERIALIZED VIEW barber_daily_stats AS
SELECT 
  barber_id,
  DATE(appointment_time) as stat_date,
  COUNT(*) as booking_count,
  SUM(total_price) as revenue,
  SUM(platform_fee) as platform_fees,
  SUM(barber_payout) as barber_payout,
  SUM(tip_amount) as tips,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
  COUNT(*) FILTER (WHERE status = 'no_show') as no_show_count,
  COUNT(*) FILTER (WHERE payment_method = 'cash') as cash_bookings,
  COUNT(*) FILTER (WHERE payment_method = 'in_app') as app_bookings
FROM appointments
GROUP BY barber_id, DATE(appointment_time);

-- Index for fast lookups
CREATE UNIQUE INDEX idx_barber_stats_unique ON barber_daily_stats(barber_id, stat_date);
CREATE INDEX idx_barber_stats_date ON barber_daily_stats(stat_date DESC);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_barber_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY barber_daily_stats;
END;
$$ LANGUAGE plpgsql;

-- Auto-refresh trigger (runs after appointment updates)
CREATE OR REPLACE FUNCTION trigger_refresh_barber_stats()
RETURNS trigger AS $$
BEGIN
  PERFORM refresh_barber_stats();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_stats_after_appointment
  AFTER INSERT OR UPDATE OR DELETE ON appointments
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_refresh_barber_stats();
      `
    },
    {
      name: '002_client_stats_materialized_view',
      content: `
-- Materialized view for barber client statistics
CREATE MATERIALIZED VIEW barber_client_stats AS
SELECT 
  barber_id,
  customer_id,
  COUNT(*) as visit_count,
  MAX(appointment_time) as last_visit,
  MIN(appointment_time) as first_visit,
  SUM(total_price) as lifetime_spend,
  AVG(total_price) as avg_booking_value,
  CASE 
    WHEN COUNT(*) >= 10 THEN 'vip'
    WHEN COUNT(*) >= 5 THEN 'loyal'
    WHEN COUNT(*) >= 2 THEN 'returning'
    ELSE 'new'
  END as loyalty_tier,
  CASE 
    WHEN MAX(appointment_time) < NOW() - INTERVAL '60 days' THEN true
    ELSE false
  END as at_risk
FROM appointments
WHERE status IN ('completed', 'confirmed')
GROUP BY barber_id, customer_id;

-- Indexes
CREATE UNIQUE INDEX idx_client_stats_unique ON barber_client_stats(barber_id, customer_id);
CREATE INDEX idx_client_stats_loyalty ON barber_client_stats(barber_id, loyalty_tier);
CREATE INDEX idx_client_stats_risk ON barber_client_stats(barber_id, at_risk) WHERE at_risk = true;

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_client_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY barber_client_stats;
END;
$$ LANGUAGE plpgsql;
      `
    },
    {
      name: '003_services_enhancements',
      content: `
-- Add category and sorting to services
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'haircuts',
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS popularity_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS avg_duration_minutes INTEGER;

-- Update existing services with categories
UPDATE services SET category = 'haircuts' WHERE name ILIKE '%haircut%' OR name ILIKE '%cut%';
UPDATE services SET category = 'facial_hair' WHERE name ILIKE '%beard%' OR name ILIKE '%facial%';
UPDATE services SET category = 'kids' WHERE name ILIKE '%kid%' OR name ILIKE '%child%';
UPDATE services SET category = 'combos' WHERE name ILIKE '%+%' OR name ILIKE '%and%';

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_services_category ON services(barber_id, category, sort_order);

-- Function to update popularity scores
CREATE OR REPLACE FUNCTION update_service_popularity()
RETURNS void AS $$
BEGIN
  UPDATE services s
  SET popularity_score = (
    SELECT COUNT(*)
    FROM appointments a
    WHERE a.service_id = s.id
      AND a.status IN ('completed', 'confirmed')
      AND a.appointment_time > NOW() - INTERVAL '90 days'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to update average durations
CREATE OR REPLACE FUNCTION update_service_avg_duration()
RETURNS void AS $$
BEGIN
  UPDATE services s
  SET avg_duration_minutes = (
    SELECT AVG(actual_duration_minutes)::INTEGER
    FROM appointments a
    WHERE a.service_id = s.id
      AND a.status = 'completed'
      AND a.actual_duration_minutes IS NOT NULL
  )
  WHERE EXISTS (
    SELECT 1 FROM appointments a 
    WHERE a.service_id = s.id AND a.actual_duration_minutes IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql;
      `
    }
  ];

  const migrationsDir = path.join(PROJECT_ROOT, 'supabase/migrations');
  
  migrations.forEach(({ name, content }) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `${timestamp}_${name}.sql`;
    const filepath = path.join(migrationsDir, filename);
    
    fs.writeFileSync(filepath, content.trim());
    log(`✓ Created migration: ${filename}`, 'green');
  });

  log('\n✓ All database migrations created', 'green');
  log('  Run: supabase db push to apply', 'blue');
}

// ============================================================
// PHASE 2: SERVICE LAYER
// ============================================================

function createServiceLayer() {
  section('Phase 2: Creating Service Layer');

  const services = {
    'barberStatsService.ts': `
import { supabase } from '../lib/supabaseClient';
import type { BarberDailyStats, BarberWeeklyStats } from '../types/stats';

export class BarberStatsService {
  /**
   * Get today's stats for barber dashboard
   */
  static async getTodayStats(barberId: string): Promise<BarberDailyStats> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('barber_daily_stats')
      .select('*')
      .eq('barber_id', barberId)
      .eq('stat_date', today)
      .single();

    if (error || !data) {
      return {
        bookingCount: 0,
        revenue: 0,
        platformFees: 0,
        barberPayout: 0,
        tips: 0,
        completedCount: 0,
        noShowCount: 0,
      };
    }

    return {
      bookingCount: data.booking_count,
      revenue: parseFloat(data.revenue || 0),
      platformFees: parseFloat(data.platform_fees || 0),
      barberPayout: parseFloat(data.barber_payout || 0),
      tips: parseFloat(data.tips || 0),
      completedCount: data.completed_count,
      noShowCount: data.no_show_count,
    };
  }

  /**
   * Get weekly stats with daily breakdown
   */
  static async getWeekStats(barberId: string): Promise<BarberWeeklyStats> {
    const weekStart = this.getWeekStart();
    const weekEnd = this.getWeekEnd();

    const { data, error } = await supabase
      .from('barber_daily_stats')
      .select('*')
      .eq('barber_id', barberId)
      .gte('stat_date', weekStart)
      .lte('stat_date', weekEnd)
      .order('stat_date', { ascending: true });

    if (error || !data) {
      return {
        totalBookings: 0,
        totalRevenue: 0,
        totalTips: 0,
        dailyBreakdown: [],
      };
    }

    const totalBookings = data.reduce((sum, day) => sum + day.booking_count, 0);
    const totalRevenue = data.reduce((sum, day) => sum + parseFloat(day.revenue || 0), 0);
    const totalTips = data.reduce((sum, day) => sum + parseFloat(day.tips || 0), 0);

    return {
      totalBookings,
      totalRevenue,
      totalTips,
      dailyBreakdown: data.map(day => ({
        date: day.stat_date,
        bookings: day.booking_count,
        revenue: parseFloat(day.revenue || 0),
        tips: parseFloat(day.tips || 0),
      })),
    };
  }

  /**
   * Get next upcoming appointment
   */
  static async getNextAppointment(barberId: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select(\`
        *,
        customer:customer_id (
          id,
          full_name,
          avatar_url
        ),
        service:service_id (
          name,
          price
        )
      \`)
      .eq('barber_id', barberId)
      .gte('appointment_time', new Date().toISOString())
      .in('status', ['confirmed', 'pending'])
      .order('appointment_time', { ascending: true })
      .limit(1)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      time: new Date(data.appointment_time),
      clientName: data.customer?.full_name || 'Unknown',
      clientAvatar: data.customer?.avatar_url,
      serviceName: data.service?.name || 'Service',
      servicePrice: data.service?.price || 0,
      status: data.status,
    };
  }

  private static getWeekStart(): string {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek;
    const weekStart = new Date(now.setDate(diff));
    return weekStart.toISOString().split('T')[0];
  }

  private static getWeekEnd(): string {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + 6;
    const weekEnd = new Date(now.setDate(diff));
    return weekEnd.toISOString().split('T')[0];
  }
}
    `,

    'clientManagementService.ts': `
import { supabase } from '../lib/supabaseClient';
import type { ClientStats, ClientListItem } from '../types/clients';

export class ClientManagementService {
  /**
   * Get total client count for barber
   */
  static async getClientCount(barberId: string): Promise<number> {
    const { count, error } = await supabase
      .from('barber_client_stats')
      .select('*', { count: 'exact', head: true })
      .eq('barber_id', barberId);

    if (error) return 0;
    return count || 0;
  }

  /**
   * Get clients grouped by first letter
   */
  static async getClientsGrouped(barberId: string): Promise<Record<string, ClientListItem[]>> {
    const { data, error } = await supabase
      .from('barber_client_stats')
      .select(\`
        *,
        customer:customer_id (
          id,
          full_name,
          avatar_url
        )
      \`)
      .eq('barber_id', barberId)
      .order('customer.full_name', { ascending: true });

    if (error || !data) return {};

    const grouped: Record<string, ClientListItem[]> = {};

    data.forEach(stats => {
      const name = stats.customer?.full_name || 'Unknown';
      const firstLetter = name.charAt(0).toUpperCase();

      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }

      grouped[firstLetter].push({
        id: stats.customer_id,
        name,
        avatarUrl: stats.customer?.avatar_url,
        visitCount: stats.visit_count,
        lastVisit: new Date(stats.last_visit),
        lifetimeSpend: parseFloat(stats.lifetime_spend || 0),
        loyaltyTier: stats.loyalty_tier,
        atRisk: stats.at_risk,
      });
    });

    return grouped;
  }

  /**
   * Get detailed client statistics
   */
  static async getClientStats(barberId: string, customerId: string): Promise<ClientStats | null> {
    const { data, error } = await supabase
      .from('barber_client_stats')
      .select('*')
      .eq('barber_id', barberId)
      .eq('customer_id', customerId)
      .single();

    if (error || !data) return null;

    return {
      visitCount: data.visit_count,
      lastVisit: new Date(data.last_visit),
      firstVisit: new Date(data.first_visit),
      lifetimeSpend: parseFloat(data.lifetime_spend || 0),
      avgBookingValue: parseFloat(data.avg_booking_value || 0),
      loyaltyTier: data.loyalty_tier,
      atRisk: data.at_risk,
    };
  }
}
    `
  };

  const servicesDir = path.join(PROJECT_ROOT, 'src/services');

  Object.entries(services).forEach(([filename, content]) => {
    const filepath = path.join(servicesDir, filename);
    fs.writeFileSync(filepath, content.trim());
    log(`✓ Created service: ${filename}`, 'green');
  });

  log('\n✓ All service layers created', 'green');
}

// ============================================================
// PHASE 3: COMPONENT GENERATION
// ============================================================

function generateComponents() {
  section('Phase 3: Generating React Components');

  log('Component generation requires careful implementation.', 'yellow');
  log('Creating component stubs for each feature...', 'blue');

  const features = CONFIG.config.features;

  features.forEach(feature => {
    log(`\n  Feature: ${feature.id} (${feature.priority})`, 'bright');
    
    feature.components.forEach(componentName => {
      const componentPath = getComponentPath(feature.id, componentName);
      const componentContent = generateComponentStub(feature.id, componentName);
      
      const fullPath = path.join(PROJECT_ROOT, 'src', componentPath);
      const dir = path.dirname(fullPath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(fullPath, componentContent);
      log(`    ✓ ${componentName}.tsx`, 'green');
    });
  });

  log('\n✓ All component stubs created', 'green');
  log('  Next: Implement component logic manually or with AI assistance', 'blue');
}

function getComponentPath(featureId, componentName) {
  const paths = {
    'enhanced_dashboard': `components/barber/dashboard/${componentName}.tsx`,
    'schedule_week_view': `components/barber/schedule/${componentName}.tsx`,
    'enhanced_services': `components/services/${componentName}.tsx`,
    'client_management': `components/barber/clients/${componentName}.tsx`,
    'profile_hub': `components/barber/profile/${componentName}.tsx`,
  };
  
  return paths[featureId] || `components/${componentName}.tsx`;
}

function generateComponentStub(featureId, componentName) {
  return `
import React from 'react';

interface ${componentName}Props {
  // TODO: Define props based on feature requirements
}

/**
 * ${componentName}
 * Part of: ${featureId}
 * 
 * TODO: Implement component logic
 * See: /agents/thecut-features/implementation-plan.md
 */
export function ${componentName}(props: ${componentName}Props) {
  return (
    <div className="${componentName.toLowerCase()}">
      {/* TODO: Implement ${componentName} */}
      <p>Component stub: ${componentName}</p>
    </div>
  );
}
  `.trim();
}

// ============================================================
// MAIN EXECUTION
// ============================================================

function main() {
  log('\n' + '='.repeat(60), 'bright');
  log('TheCut Features Implementation Agent'.toUpperCase(), 'bright');
  log('='.repeat(60), 'bright');
  log(`Project: Direct Cuts`, 'blue');
  log(`Features: ${CONFIG.config.features.length}`, 'blue');
  log(`Total Estimate: ${CONFIG.config.features.reduce((sum, f) => sum + f.days_estimate, 0)} days`, 'blue');
  
  const args = process.argv.slice(2);
  const phase = args[0] || 'all';

  if (phase === 'all' || phase === 'migrations') {
    createDatabaseMigrations();
  }

  if (phase === 'all' || phase === 'services') {
    createServiceLayer();
  }

  if (phase === 'all' || phase === 'components') {
    generateComponents();
  }

  section('Execution Complete');
  log('Next steps:', 'bright');
  log('1. Review generated files', 'blue');
  log('2. Run: supabase db push', 'blue');
  log('3. Implement component logic', 'blue');
  log('4. Run tests', 'blue');
  log('5. Deploy to staging\n', 'blue');
}

main();
