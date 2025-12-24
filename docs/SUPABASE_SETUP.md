# Supabase Setup Guide for DermAI

## 🎯 Quick Start

This guide will help you set up Supabase for DermAI in under 10 minutes.

---

## Step 1: Create Supabase Project (2 minutes)

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub (or create account)
4. Click "New Project"
5. Fill in:
   - **Name**: `derm-ai`
   - **Database Password**: (generate a strong password - save it!)
   - **Region**: Choose closest to you
6. Click "Create new project"
7. Wait ~2 minutes for project to be ready

---

## Step 2: Get API Keys (1 minute)

1. In your Supabase project dashboard
2. Click "Settings" (gear icon) in sidebar
3. Click "API"
4. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long string)

---

## Step 3: Create Database Tables (3 minutes)

1. Click "SQL Editor" in sidebar
2. Click "New query"
3. Copy and paste this SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create skin_analyses table
CREATE TABLE skin_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    image_filename VARCHAR(255),
    predicted_condition VARCHAR(100),
    confidence_score DECIMAL(5,4),
    analysis_data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_skin_analyses_user_id ON skin_analyses(user_id);
CREATE INDEX idx_skin_analyses_created_at ON skin_analyses(created_at DESC);

-- Create chat_messages table
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to skin_analyses
CREATE TRIGGER update_skin_analyses_updated_at 
    BEFORE UPDATE ON skin_analyses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

4. Click "Run" (or press Ctrl+Enter)
5. You should see "Success. No rows returned"

---

## Step 4: Create Storage Bucket (2 minutes)

1. Click "Storage" in sidebar
2. Click "New bucket"
3. Fill in:
   - **Name**: `skin-images`
   - **Public bucket**: ✅ Check this (images need to be accessible)
4. Click "Create bucket"
5. Click on the `skin-images` bucket
6. Click "Policies" tab
7. Click "New policy"
8. Select "Allow public access for SELECT"
9. Click "Review"
10. Click "Save policy"

---

## Step 5: Configure Backend (2 minutes)

1. Open `backend/.env` file
2. Add these lines:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-key-here
```

3. Replace with your actual values from Step 2
4. Save the file

---

## Step 6: Install Dependencies & Test (2 minutes)

```bash
# Navigate to backend
cd backend

# Install Supabase package
pip install supabase==2.3.4

# Test connection
python -c "from services.supabase_service import get_supabase_service; s = get_supabase_service(); print(s.health_check())"
```

You should see:

```python
{
    'enabled': True,
    'connected': True,
    'message': 'Supabase connection healthy'
}
```

---

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] API keys copied
- [ ] Database tables created
- [ ] Storage bucket created
- [ ] Storage policies configured
- [ ] Environment variables set
- [ ] Dependencies installed
- [ ] Connection test passed

---

## 🔧 Troubleshooting

### "Supabase credentials not configured"

- Check `.env` file has `SUPABASE_URL` and `SUPABASE_KEY`
- Make sure there are no spaces around the `=` sign
- Restart the backend server

### "Connection failed"

- Verify the URL is correct (should start with `https://`)
- Check the API key is the **anon/public** key, not the service key
- Make sure your internet connection is working

### "Table does not exist"

- Go to Supabase SQL Editor
- Run the table creation SQL again
- Check for any error messages

### "Storage upload failed"

- Make sure the bucket is set to **public**
- Check the bucket name is exactly `skin-images`
- Verify storage policies allow public access

---

## 📊 Database Schema Reference

### `skin_analyses` Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | VARCHAR(255) | User identifier |
| image_url | TEXT | URL to uploaded image |
| image_filename | VARCHAR(255) | Original filename |
| predicted_condition | VARCHAR(100) | AI prediction |
| confidence_score | DECIMAL(5,4) | Confidence (0-1) |
| analysis_data | JSONB | Full analysis results |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

### `chat_messages` Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | VARCHAR(255) | User identifier |
| role | VARCHAR(20) | 'user' or 'assistant' |
| content | TEXT | Message content |
| created_at | TIMESTAMP | Creation time |

---

## 🎯 Next Steps

After completing this setup:

1. **Restart the backend server**

   ```bash
   python app.py
   ```

2. **Test the application**
   - Upload an image
   - Check if it appears in Supabase Storage
   - Verify data in Database tables

3. **Monitor usage**
   - Go to Supabase Dashboard
   - Check "Database" → "Tables" to see data
   - Check "Storage" → "skin-images" to see uploaded images

---

## 💡 Tips

- **Free Tier Limits**:
  - 500MB database
  - 1GB file storage
  - 50,000 monthly active users
  - 2GB bandwidth

- **Upgrade if needed**:
  - Pro plan: $25/month
  - Unlimited projects
  - More storage and bandwidth

- **Backup your data**:
  - Supabase has automatic backups
  - You can also export manually from SQL Editor

---

## 🔐 Security Best Practices

1. **Never commit `.env` file** to git
2. **Use Row Level Security** (RLS) for production
3. **Rotate API keys** periodically
4. **Monitor usage** in Supabase dashboard
5. **Set up alerts** for unusual activity

---

**Setup complete! Your DermAI backend is now powered by Supabase! 🎉**

*Estimated total time: 10-12 minutes*
