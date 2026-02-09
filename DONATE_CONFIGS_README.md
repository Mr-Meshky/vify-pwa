# Donate Configs Feature

A complete community-driven VPN/Proxy configuration donation system for Vify.

## Overview

This feature allows users to submit their working VPN and proxy configurations to help others bypass internet restrictions. All submissions go through a moderation process before being approved.

## Features

### Public Submission Page (`/donate-config`)

- **Config Submission Form**: Users can submit various types of configs (VMess, VLess, Trojan, Shadowsocks, WireGuard, etc.)
- **Location Information**: Optional country and region fields to help users find configs for their area
- **Network Compatibility**: Users can specify which networks the config works on (WiFi, Mobile Data, 4G, 5G, etc.)
- **Use Case Selection**: General browsing, streaming, gaming, social media, or privacy
- **Contributor Information**: Optional nickname and Telegram username for leaderboard recognition
- **Live Leaderboard**: Top 10 contributors displayed with their scores and levels
- **Community Stats**: Total configs shared, active contributors, and countries covered
- **Submission Guidelines**: Clear rules for what to submit and what not to submit

### Admin Dashboard (`/admin/configs`)

- **Moderation Interface**: Review pending, approved, and rejected submissions
- **Statistics Overview**: Real-time stats showing pending, approved, rejected, and today's submissions
- **Detailed Review Dialog**: Full config details including:
  - Config type, location, and contributor info
  - Network compatibility badges
  - Use case information
  - Full config content with copy functionality
  - Duplicate detection warnings
  - Admin notes field for internal documentation
- **Bulk Actions**: Filter by status and review multiple submissions efficiently
- **Approve/Reject Actions**: One-click approval or rejection with optional admin notes

## Database Schema

### Tables

1. **config_submissions**
   - Stores all config submissions
   - Fields: config type, content, location, network compatibility, contributor info, status, etc.
   - Status options: pending, approved, rejected
   - Duplicate detection flag
   - Quality score for future ranking

2. **contributors**
   - Tracks contributor statistics
   - Fields: nickname, telegram username, submission counts, contributor score, level
   - Levels: New, Contributor, Trusted, Elite
   - Auto-updated via database trigger

3. **submission_rate_limits**
   - IP-based rate limiting
   - Prevents spam (5 submissions per hour per IP)
   - Auto-resets after time window

### Triggers

- **update_contributor_stats()**: Automatically updates contributor stats when configs are approved/rejected
- **Contributor Levels**:
  - New: 0-9 points
  - Contributor: 10-49 points
  - Trusted: 50-99 points
  - Elite: 100+ points
- **Points**: +10 per approved config

### Row Level Security (RLS)

- Public can view approved submissions
- Anyone can submit configs
- Public can view contributor leaderboard
- Service role has full access for admin operations

## API Endpoints

### Public Endpoints

1. **POST /api/donate-config/submit**
   - Submit a new configuration
   - Rate limited (5 submissions/hour per IP)
   - Automatic duplicate detection
   - Returns submission ID and success message

2. **GET /api/donate-config/leaderboard**
   - Get top 10 contributors
   - Ordered by contributor score
   - Public access

### Admin Endpoints

1. **GET /api/admin/configs?status={status}**
   - Fetch submissions by status
   - Returns submissions and stats
   - Status options: pending, approved, rejected, all

2. **POST /api/admin/configs/review**
   - Review a submission (approve/reject)
   - Updates submission status
   - Triggers contributor stats update
   - Requires: config_id, status, optional admin_notes

## Rate Limiting

- **5 submissions per hour** per IP address
- Window resets after 1 hour
- Tracked in `submission_rate_limits` table
- Returns 429 status when limit exceeded

## Security Features

1. **Row Level Security (RLS)**: All tables have RLS policies enabled
2. **Rate Limiting**: Prevents spam and abuse
3. **Duplicate Detection**: Automatically flags similar configs
4. **IP Tracking**: Logs submission IPs for security (not displayed publicly)
5. **Moderation**: All configs reviewed before public access

## Gamification

- **Contributor Levels**: Progression system to encourage quality submissions
- **Leaderboard**: Top contributors showcased on submission page
- **Points System**: Earn points for approved configs
- **Public Recognition**: Nicknames and Telegram usernames displayed

## Usage

### For Contributors

1. Visit `/donate-config`
2. Select your config type
3. Paste your working config
4. Fill in optional location and compatibility info
5. Add your nickname and Telegram username to appear on leaderboard
6. Submit and wait for review

### For Admins

1. Visit `/admin/configs`
2. Review pending submissions
3. Click "Review" on any submission
4. Check config details, location, and duplicate warnings
5. Add optional admin notes
6. Approve or reject the submission
7. Stats and leaderboard update automatically

## Environment Variables

The Supabase integration requires these environment variables (automatically set by v0):

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for admin operations

## Next Steps

### Recommended Enhancements

1. **Authentication**: Add admin login to protect `/admin/configs`
2. **Quality Scoring**: Implement automatic quality assessment
3. **Testing System**: Let users test configs before submission
4. **Reporting**: Add reporting for non-working configs
5. **Statistics**: More detailed analytics and charts
6. **Notifications**: Email/Telegram notifications for contributors
7. **Search & Filter**: Public search for approved configs by location/type
8. **Export**: Bulk export of approved configs

### Admin Features to Add

1. **Bulk Actions**: Approve/reject multiple submissions at once
2. **User Management**: Ban abusive IPs or contributors
3. **Config Testing**: Built-in testing tool for submitted configs
4. **Analytics Dashboard**: Detailed stats and trends
5. **Backup System**: Regular backups of approved configs

## File Structure

```
app/
  donate-config/
    page.tsx                           # Public submission page
    layout.tsx                         # Metadata for submission page
  admin/
    configs/
      page.tsx                         # Admin dashboard
      layout.tsx                       # Admin metadata
  api/
    donate-config/
      submit/route.ts                  # Submit config endpoint
      leaderboard/route.ts             # Leaderboard endpoint
    admin/
      configs/
        route.ts                       # Get submissions endpoint
        review/route.ts                # Review submission endpoint
lib/
  supabase/
    client.ts                          # Supabase client setup
    server.ts                          # Supabase server setup
    proxy.ts                           # Session management
middleware.ts                          # Next.js middleware
scripts/
  01-create-donate-configs-tables.sql  # Database schema
```

## Support

For issues or questions:
1. Check this documentation first
2. Review the API responses for error messages
3. Check browser console for client-side errors
4. Review server logs for backend issues

## License

Part of the Vify project.
