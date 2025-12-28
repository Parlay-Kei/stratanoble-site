# Module: auth

## Owns
- Tables: users, user_sessions, auth_providers
- Events published: user.authenticated.v1, user.session.created.v1, user.session.expired.v1
- APIs: /api/auth/login, /api/auth/logout, /api/auth/session
- Core responsibilities: User authentication, session management, password policies

## Depends on
- Internal modules (via interfaces only): shared (for common types)
- External services: Supabase Auth

## Does not contain
- UI logic
- Cross-module data writes
- Business rules outside domain layer
