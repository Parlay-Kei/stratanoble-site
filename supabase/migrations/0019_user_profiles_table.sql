-- User profiles table for role-based access control
-- Enables admin access to CRM, leads, and analytics

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Profile Information
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,

    -- Role-Based Access
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'client', 'coach')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),

    -- Permissions
    can_access_crm BOOLEAN DEFAULT FALSE,
    can_manage_leads BOOLEAN DEFAULT FALSE,
    can_view_analytics BOOLEAN DEFAULT FALSE,
    can_manage_clients BOOLEAN DEFAULT FALSE,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    last_seen_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);

-- Trigger to update updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile" ON user_profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Policy: Users can update their own profile (except role/permissions)
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id
        AND role = (SELECT role FROM user_profiles WHERE id = auth.uid())
        AND can_access_crm = (SELECT can_access_crm FROM user_profiles WHERE id = auth.uid())
        AND can_manage_leads = (SELECT can_manage_leads FROM user_profiles WHERE id = auth.uid())
        AND can_view_analytics = (SELECT can_view_analytics FROM user_profiles WHERE id = auth.uid())
    );

-- Policy: Service role can manage all profiles
CREATE POLICY "Service role can manage all profiles" ON user_profiles
    FOR ALL
    USING (auth.role() = 'service_role');

-- Policy: Admin users can read all profiles
CREATE POLICY "Admin can read all profiles" ON user_profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, email, full_name, role, status)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        'user',  -- Default role
        'active'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Function to grant admin access (call this manually for admin users)
CREATE OR REPLACE FUNCTION grant_admin_access(user_email TEXT)
RETURNS void AS $$
BEGIN
    UPDATE user_profiles
    SET role = 'admin',
        can_access_crm = TRUE,
        can_manage_leads = TRUE,
        can_view_analytics = TRUE,
        can_manage_clients = TRUE,
        updated_at = NOW()
    WHERE email = user_email;

    RAISE NOTICE 'Admin access granted to %', user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example usage to make yourself admin:
-- SELECT grant_admin_access('your-email@domain.com');
