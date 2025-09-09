@echo off
echo Running database migration to TIMESTAMPTZ...
psql -U postgres -d smartdesk -f migrate_to_timestamptz.sql
echo Migration completed!
pause