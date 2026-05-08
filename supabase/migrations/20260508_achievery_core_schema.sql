-- ENGDEL-SN-ACHIEVERY-ENGMT-0146
-- Achievery foundational schema: engagements, systems, tasks, actions, proof, blockers

-- ─── TABLES ───────────────────────────────────────────────────────────────────

CREATE TABLE achievery_engagements (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operator_user_id  uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title             text        NOT NULL,
  status            text        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE achievery_systems (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id  uuid        NOT NULL REFERENCES achievery_engagements(id) ON DELETE CASCADE,
  name           text        NOT NULL,
  description    text,
  stage          text        NOT NULL DEFAULT 'diagnose' CHECK (stage IN ('diagnose', 'build', 'launch', 'optimize'))
);

CREATE TABLE achievery_tasks (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id      uuid        NOT NULL REFERENCES achievery_systems(id) ON DELETE CASCADE,
  engagement_id  uuid        NOT NULL REFERENCES achievery_engagements(id) ON DELETE CASCADE,
  title          text        NOT NULL,
  cadence        text        NOT NULL CHECK (cadence IN ('daily', 'weekly', 'one-time')),
  assigned_to    text        NOT NULL CHECK (assigned_to IN ('operator', 'client', 'both')),
  status         text        NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'complete', 'blocked'))
);

CREATE TABLE achievery_actions (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id   uuid        NOT NULL REFERENCES achievery_engagements(id) ON DELETE CASCADE,
  task_id         uuid        REFERENCES achievery_tasks(id) ON DELETE SET NULL,
  actor_type      text        NOT NULL CHECK (actor_type IN ('operator', 'client')),
  actor_user_id   uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_text      text        NOT NULL,
  visibility      text        NOT NULL DEFAULT 'shared' CHECK (visibility IN ('internal', 'shared')),
  logged_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE achievery_proof (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id  uuid        NOT NULL REFERENCES achievery_engagements(id) ON DELETE CASCADE,
  action_id      uuid        REFERENCES achievery_actions(id) ON DELETE SET NULL,
  task_id        uuid        REFERENCES achievery_tasks(id) ON DELETE SET NULL,
  note           text        NOT NULL,
  uploaded_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE achievery_blockers (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id  uuid        NOT NULL REFERENCES achievery_engagements(id) ON DELETE CASCADE,
  task_id        uuid        REFERENCES achievery_tasks(id) ON DELETE SET NULL,
  reported_by    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description    text        NOT NULL,
  resolved       boolean     NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- ─── INDEXES ──────────────────────────────────────────────────────────────────

CREATE INDEX idx_achievery_engagements_client   ON achievery_engagements(client_user_id);
CREATE INDEX idx_achievery_engagements_operator ON achievery_engagements(operator_user_id);
CREATE INDEX idx_achievery_systems_engagement   ON achievery_systems(engagement_id);
CREATE INDEX idx_achievery_tasks_engagement     ON achievery_tasks(engagement_id);
CREATE INDEX idx_achievery_tasks_system         ON achievery_tasks(system_id);
CREATE INDEX idx_achievery_actions_engagement   ON achievery_actions(engagement_id);
CREATE INDEX idx_achievery_actions_logged_at    ON achievery_actions(logged_at DESC);
CREATE INDEX idx_achievery_proof_engagement     ON achievery_proof(engagement_id);
CREATE INDEX idx_achievery_blockers_engagement  ON achievery_blockers(engagement_id);

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────

ALTER TABLE achievery_engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievery_systems     ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievery_tasks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievery_actions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievery_proof       ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievery_blockers    ENABLE ROW LEVEL SECURITY;

-- achievery_engagements
CREATE POLICY "operator can manage their engagements"
  ON achievery_engagements
  FOR ALL
  TO authenticated
  USING (operator_user_id = auth.uid())
  WITH CHECK (operator_user_id = auth.uid());

CREATE POLICY "client can view their engagement"
  ON achievery_engagements
  FOR SELECT
  TO authenticated
  USING (client_user_id = auth.uid());

-- achievery_systems (client read-only via engagement)
CREATE POLICY "operator can manage systems in their engagements"
  ON achievery_systems
  FOR ALL
  TO authenticated
  USING (
    engagement_id IN (
      SELECT id FROM achievery_engagements WHERE operator_user_id = auth.uid()
    )
  )
  WITH CHECK (
    engagement_id IN (
      SELECT id FROM achievery_engagements WHERE operator_user_id = auth.uid()
    )
  );

CREATE POLICY "client can view systems in their engagement"
  ON achievery_systems
  FOR SELECT
  TO authenticated
  USING (
    engagement_id IN (
      SELECT id FROM achievery_engagements WHERE client_user_id = auth.uid()
    )
  );

-- achievery_tasks (client read-only via engagement)
CREATE POLICY "operator can manage tasks in their engagements"
  ON achievery_tasks
  FOR ALL
  TO authenticated
  USING (
    engagement_id IN (
      SELECT id FROM achievery_engagements WHERE operator_user_id = auth.uid()
    )
  )
  WITH CHECK (
    engagement_id IN (
      SELECT id FROM achievery_engagements WHERE operator_user_id = auth.uid()
    )
  );

CREATE POLICY "client can view tasks in their engagement"
  ON achievery_tasks
  FOR SELECT
  TO authenticated
  USING (
    engagement_id IN (
      SELECT id FROM achievery_engagements WHERE client_user_id = auth.uid()
    )
  );

-- achievery_actions: operator sees all; client sees shared or own
CREATE POLICY "operator can manage all actions in their engagements"
  ON achievery_actions
  FOR ALL
  TO authenticated
  USING (
    engagement_id IN (
      SELECT id FROM achievery_engagements WHERE operator_user_id = auth.uid()
    )
  )
  WITH CHECK (
    engagement_id IN (
      SELECT id FROM achievery_engagements WHERE operator_user_id = auth.uid()
    )
  );

CREATE POLICY "client can insert their own actions"
  ON achievery_actions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    actor_user_id = auth.uid()
    AND engagement_id IN (
      SELECT id FROM achievery_engagements WHERE client_user_id = auth.uid()
    )
  );

CREATE POLICY "client can view shared or own actions"
  ON achievery_actions
  FOR SELECT
  TO authenticated
  USING (
    engagement_id IN (
      SELECT id FROM achievery_engagements WHERE client_user_id = auth.uid()
    )
    AND (visibility = 'shared' OR actor_user_id = auth.uid())
  );

-- achievery_proof: operator sees all; client sees shared-visibility entries
-- (proof visibility inherited from linked action or defaults to shared)
CREATE POLICY "operator can manage proof in their engagements"
  ON achievery_proof
  FOR ALL
  TO authenticated
  USING (
    engagement_id IN (
      SELECT id FROM achievery_engagements WHERE operator_user_id = auth.uid()
    )
  )
  WITH CHECK (
    engagement_id IN (
      SELECT id FROM achievery_engagements WHERE operator_user_id = auth.uid()
    )
  );

CREATE POLICY "client can view proof in their engagement"
  ON achievery_proof
  FOR SELECT
  TO authenticated
  USING (
    engagement_id IN (
      SELECT id FROM achievery_engagements WHERE client_user_id = auth.uid()
    )
    AND (
      action_id IS NULL
      OR action_id IN (
        SELECT id FROM achievery_actions
        WHERE visibility = 'shared'
          OR actor_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "client can insert proof for their own actions"
  ON achievery_proof
  FOR INSERT
  TO authenticated
  WITH CHECK (
    engagement_id IN (
      SELECT id FROM achievery_engagements WHERE client_user_id = auth.uid()
    )
  );

-- achievery_blockers: operator sees all; client can insert and view their own
CREATE POLICY "operator can manage blockers in their engagements"
  ON achievery_blockers
  FOR ALL
  TO authenticated
  USING (
    engagement_id IN (
      SELECT id FROM achievery_engagements WHERE operator_user_id = auth.uid()
    )
  )
  WITH CHECK (
    engagement_id IN (
      SELECT id FROM achievery_engagements WHERE operator_user_id = auth.uid()
    )
  );

CREATE POLICY "client can report blockers in their engagement"
  ON achievery_blockers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    reported_by = auth.uid()
    AND engagement_id IN (
      SELECT id FROM achievery_engagements WHERE client_user_id = auth.uid()
    )
  );

CREATE POLICY "client can view their blockers"
  ON achievery_blockers
  FOR SELECT
  TO authenticated
  USING (
    reported_by = auth.uid()
    OR engagement_id IN (
      SELECT id FROM achievery_engagements WHERE client_user_id = auth.uid()
    )
  );
