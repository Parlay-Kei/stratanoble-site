#!/usr/bin/env python3
"""
Execute Social Media Agent migration via direct PostgreSQL connection.
Uses connection pooler with service role.
"""

import subprocess
import sys

# Strata Noble database connection
# Format: postgresql://[user]:[password]@[host]:[port]/[database]
# Using the transaction pooler (port 6543) for session mode

PROJECT_REF = 'bvneqoevtwodyfqglpzi'
SCHEMA_FILE = r'C:\Dev\.claude-anx\mcp-servers\social-media-agent\schema.sql'

# Connection using pooler
DB_HOST = f'db.{PROJECT_REF}.supabase.co'
DB_PORT = '5432'
DB_NAME = 'postgres'
DB_USER = 'postgres'

def main():
    print("Social Media Agent Migration for Strata Noble")
    print("=" * 50)
    print(f"\nProject: {PROJECT_REF}")
    print(f"Schema: {SCHEMA_FILE}")
    print(f"\nThis script requires the database password.")
    print("\nTo get the password:")
    print("1. Go to: https://supabase.com/dashboard/project/bvneqoevtwodyfqglpzi/settings/database")
    print("2. Copy the 'Database password' (not the service role key)")
    print("\nAlternatively, use the SQL Editor directly:")
    print("https://supabase.com/dashboard/project/bvneqoevtwodyfqglpzi/sql/new")
    print("\nPaste the contents of schema.sql and click Run.")

if __name__ == '__main__':
    main()
