create table achievery_weekly_summaries (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references achievery_engagements(id)
    on delete cascade,
  week_start date not null,
  content text not null,
  next_steps jsonb not null default '[]',
  health_signal text not null check (
    health_signal in ('on_track', 'needs_attention', 'stalled')
  ),
  generated_by uuid not null,
  generated_at timestamptz not null default now(),
  unique(engagement_id, week_start)
);

alter table achievery_weekly_summaries enable row level security;

create policy "operator_all" on achievery_weekly_summaries
  for all using (
    engagement_id in (
      select id from achievery_engagements
      where operator_user_id = auth.uid()
    )
  );

create policy "client_read" on achievery_weekly_summaries
  for select using (
    engagement_id in (
      select id from achievery_engagements
      where client_user_id = auth.uid()
    )
  );

-- Explicit grants required as of Supabase Data API change (Oct 30 2026, existing projects)
GRANT SELECT, INSERT, UPDATE, DELETE ON achievery_weekly_summaries TO authenticated;
GRANT ALL ON achievery_weekly_summaries TO service_role;
