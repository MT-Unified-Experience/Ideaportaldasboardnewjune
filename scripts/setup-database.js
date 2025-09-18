import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tahiimcdvwlelyxrphfk.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhaGlpbWNkdndsZWx5eHJwaGZrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODIzNTY4OCwiZXhwIjoyMDczODExNjg4fQ.j61DYBuLOa00mZdhzdzBWvaBvqzGrnnG0-gKKBRPnOE';

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTables() {
  console.log('🚀 Starting database setup...');

  try {
    // 1. Create update function
    console.log('📝 Creating update function...');
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = now();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
      `
    });

    if (functionError) {
      console.error('❌ Error creating function:', functionError);
    } else {
      console.log('✅ Update function created successfully');
    }

    // 2. Create profiles table
    console.log('👤 Creating profiles table...');
    const { error: profilesError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create profiles table
        CREATE TABLE IF NOT EXISTS profiles (
          id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          full_name text,
          email text UNIQUE NOT NULL,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );

        -- Enable RLS
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

        -- Create policies
        DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
        CREATE POLICY "Users can read own profile"
          ON profiles
          FOR SELECT
          TO authenticated
          USING (auth.uid() = id);

        DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
        CREATE POLICY "Users can update own profile"
          ON profiles
          FOR UPDATE
          TO authenticated
          USING (auth.uid() = id);

        DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
        CREATE POLICY "Users can insert own profile"
          ON profiles
          FOR INSERT
          TO authenticated
          WITH CHECK (auth.uid() = id);

        -- Create function to handle new user signup
        CREATE OR REPLACE FUNCTION handle_new_user()
        RETURNS trigger AS $$
        BEGIN
          INSERT INTO profiles (id, email, full_name)
          VALUES (
            new.id,
            new.email,
            COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
          );
          RETURN new;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Create trigger to automatically create profile on signup
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION handle_new_user();

        -- Create trigger for updated_at
        DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
        CREATE TRIGGER update_profiles_updated_at
          BEFORE UPDATE ON profiles
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `
    });

    if (profilesError) {
      console.error('❌ Error creating profiles table:', profilesError);
    } else {
      console.log('✅ Profiles table created successfully');
    }

    // 3. Create features table
    console.log('🎯 Creating features table...');
    const { error: featuresError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create features table
        CREATE TABLE IF NOT EXISTS features (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          product text NOT NULL,
          quarter text NOT NULL,
          feature_name text NOT NULL,
          vote_count integer DEFAULT 0,
          status text NOT NULL DEFAULT 'Under Review',
          status_updated_at date,
          client_voters text[] DEFAULT '{}',
          estimated_impact text,
          resource_requirement text,
          strategic_alignment integer,
          risks text[] DEFAULT '{}',
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now(),
          UNIQUE(product, quarter, feature_name)
        );

        -- Enable RLS
        ALTER TABLE features ENABLE ROW LEVEL SECURITY;

        -- Create policies
        DROP POLICY IF EXISTS "Authenticated users can read features" ON features;
        CREATE POLICY "Authenticated users can read features"
          ON features
          FOR SELECT
          TO authenticated
          USING (true);

        DROP POLICY IF EXISTS "Authenticated users can insert features" ON features;
        CREATE POLICY "Authenticated users can insert features"
          ON features
          FOR INSERT
          TO authenticated
          WITH CHECK (true);

        DROP POLICY IF EXISTS "Authenticated users can update features" ON features;
        CREATE POLICY "Authenticated users can update features"
          ON features
          FOR UPDATE
          TO authenticated
          USING (true);

        DROP POLICY IF EXISTS "Authenticated users can delete features" ON features;
        CREATE POLICY "Authenticated users can delete features"
          ON features
          FOR DELETE
          TO authenticated
          USING (true);

        -- Create trigger for updated_at
        DROP TRIGGER IF EXISTS update_features_updated_at ON features;
        CREATE TRIGGER update_features_updated_at
          BEFORE UPDATE ON features
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_features_product_quarter ON features(product, quarter);
        CREATE INDEX IF NOT EXISTS idx_features_vote_count ON features(vote_count DESC);
      `
    });

    if (featuresError) {
      console.error('❌ Error creating features table:', featuresError);
    } else {
      console.log('✅ Features table created successfully');
    }

    // 4. Create responsiveness_trends table
    console.log('📊 Creating responsiveness_trends table...');
    const { error: responsivenessError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create responsiveness_trends table
        CREATE TABLE IF NOT EXISTS responsiveness_trends (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          product text NOT NULL,
          quarter text NOT NULL,
          percentage integer NOT NULL DEFAULT 0,
          total_ideas integer NOT NULL DEFAULT 0,
          ideas_moved_out_of_review integer NOT NULL DEFAULT 0,
          ideas_list text[] DEFAULT '{}',
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now(),
          UNIQUE(product, quarter)
        );

        -- Enable RLS
        ALTER TABLE responsiveness_trends ENABLE ROW LEVEL SECURITY;

        -- Create policies
        DROP POLICY IF EXISTS "Authenticated users can read responsiveness trends" ON responsiveness_trends;
        CREATE POLICY "Authenticated users can read responsiveness trends"
          ON responsiveness_trends
          FOR SELECT
          TO authenticated
          USING (true);

        DROP POLICY IF EXISTS "Authenticated users can insert responsiveness trends" ON responsiveness_trends;
        CREATE POLICY "Authenticated users can insert responsiveness trends"
          ON responsiveness_trends
          FOR INSERT
          TO authenticated
          WITH CHECK (true);

        DROP POLICY IF EXISTS "Authenticated users can update responsiveness trends" ON responsiveness_trends;
        CREATE POLICY "Authenticated users can update responsiveness trends"
          ON responsiveness_trends
          FOR UPDATE
          TO authenticated
          USING (true);

        DROP POLICY IF EXISTS "Authenticated users can delete responsiveness trends" ON responsiveness_trends;
        CREATE POLICY "Authenticated users can delete responsiveness trends"
          ON responsiveness_trends
          FOR DELETE
          TO authenticated
          USING (true);

        -- Create trigger for updated_at
        DROP TRIGGER IF EXISTS update_responsiveness_trends_updated_at ON responsiveness_trends;
        CREATE TRIGGER update_responsiveness_trends_updated_at
          BEFORE UPDATE ON responsiveness_trends
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_responsiveness_trends_product_quarter ON responsiveness_trends(product, quarter);
      `
    });

    if (responsivenessError) {
      console.error('❌ Error creating responsiveness_trends table:', responsivenessError);
    } else {
      console.log('✅ Responsiveness trends table created successfully');
    }

    // 5. Create all other tables
    const tables = [
      {
        name: 'commitment_trends',
        sql: `
          CREATE TABLE IF NOT EXISTS commitment_trends (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            product text NOT NULL,
            year text NOT NULL,
            committed integer,
            delivered integer,
            quarter text,
            quarterly_delivered integer,
            idea_id text,
            idea_summary text,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
          );

          ALTER TABLE commitment_trends ENABLE ROW LEVEL SECURITY;

          DROP POLICY IF EXISTS "Authenticated users can read commitment trends" ON commitment_trends;
          CREATE POLICY "Authenticated users can read commitment trends"
            ON commitment_trends FOR SELECT TO authenticated USING (true);

          DROP POLICY IF EXISTS "Authenticated users can insert commitment trends" ON commitment_trends;
          CREATE POLICY "Authenticated users can insert commitment trends"
            ON commitment_trends FOR INSERT TO authenticated WITH CHECK (true);

          DROP POLICY IF EXISTS "Authenticated users can update commitment trends" ON commitment_trends;
          CREATE POLICY "Authenticated users can update commitment trends"
            ON commitment_trends FOR UPDATE TO authenticated USING (true);

          DROP POLICY IF EXISTS "Authenticated users can delete commitment trends" ON commitment_trends;
          CREATE POLICY "Authenticated users can delete commitment trends"
            ON commitment_trends FOR DELETE TO authenticated USING (true);

          DROP TRIGGER IF EXISTS update_commitment_trends_updated_at ON commitment_trends;
          CREATE TRIGGER update_commitment_trends_updated_at
            BEFORE UPDATE ON commitment_trends
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

          CREATE INDEX IF NOT EXISTS idx_commitment_trends_product_year ON commitment_trends(product, year);
          CREATE INDEX IF NOT EXISTS idx_commitment_trends_product_quarter ON commitment_trends(product, quarter);
        `
      },
      {
        name: 'continued_engagement',
        sql: `
          CREATE TABLE IF NOT EXISTS continued_engagement (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            product text NOT NULL,
            quarter text NOT NULL,
            rate integer NOT NULL DEFAULT 0,
            numerator integer NOT NULL DEFAULT 0,
            denominator integer NOT NULL DEFAULT 0,
            idea_id text,
            idea_name text,
            initial_status_change date,
            subsequent_changes jsonb,
            days_between integer,
            included boolean,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
          );

          ALTER TABLE continued_engagement ENABLE ROW LEVEL SECURITY;

          DROP POLICY IF EXISTS "Authenticated users can read continued engagement" ON continued_engagement;
          CREATE POLICY "Authenticated users can read continued engagement"
            ON continued_engagement FOR SELECT TO authenticated USING (true);

          DROP POLICY IF EXISTS "Authenticated users can insert continued engagement" ON continued_engagement;
          CREATE POLICY "Authenticated users can insert continued engagement"
            ON continued_engagement FOR INSERT TO authenticated WITH CHECK (true);

          DROP POLICY IF EXISTS "Authenticated users can update continued engagement" ON continued_engagement;
          CREATE POLICY "Authenticated users can update continued engagement"
            ON continued_engagement FOR UPDATE TO authenticated USING (true);

          DROP POLICY IF EXISTS "Authenticated users can delete continued engagement" ON continued_engagement;
          CREATE POLICY "Authenticated users can delete continued engagement"
            ON continued_engagement FOR DELETE TO authenticated USING (true);

          DROP TRIGGER IF EXISTS update_continued_engagement_updated_at ON continued_engagement;
          CREATE TRIGGER update_continued_engagement_updated_at
            BEFORE UPDATE ON continued_engagement
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

          CREATE INDEX IF NOT EXISTS idx_continued_engagement_product_quarter ON continued_engagement(product, quarter);
        `
      },
      {
        name: 'client_submissions',
        sql: `
          CREATE TABLE IF NOT EXISTS client_submissions (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            product text NOT NULL,
            quarter text NOT NULL,
            clients_representing integer,
            client_names text[] DEFAULT '{}',
            idea_id text,
            idea_summary text,
            idea_client_name text,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
          );

          ALTER TABLE client_submissions ENABLE ROW LEVEL SECURITY;

          DROP POLICY IF EXISTS "Authenticated users can read client submissions" ON client_submissions;
          CREATE POLICY "Authenticated users can read client submissions"
            ON client_submissions FOR SELECT TO authenticated USING (true);

          DROP POLICY IF EXISTS "Authenticated users can insert client submissions" ON client_submissions;
          CREATE POLICY "Authenticated users can insert client submissions"
            ON client_submissions FOR INSERT TO authenticated WITH CHECK (true);

          DROP POLICY IF EXISTS "Authenticated users can update client submissions" ON client_submissions;
          CREATE POLICY "Authenticated users can update client submissions"
            ON client_submissions FOR UPDATE TO authenticated USING (true);

          DROP POLICY IF EXISTS "Authenticated users can delete client submissions" ON client_submissions;
          CREATE POLICY "Authenticated users can delete client submissions"
            ON client_submissions FOR DELETE TO authenticated USING (true);

          DROP TRIGGER IF EXISTS update_client_submissions_updated_at ON client_submissions;
          CREATE TRIGGER update_client_submissions_updated_at
            BEFORE UPDATE ON client_submissions
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

          CREATE INDEX IF NOT EXISTS idx_client_submissions_product_quarter ON client_submissions(product, quarter);
        `
      },
      {
        name: 'cross_client_collaboration',
        sql: `
          CREATE TABLE IF NOT EXISTS cross_client_collaboration (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            product text NOT NULL,
            quarter text NOT NULL,
            year text,
            collaborative_ideas_count integer,
            total_ideas_count integer,
            collaboration_rate integer,
            idea_id text,
            idea_name text,
            original_submitter text,
            contributors text[] DEFAULT '{}',
            submission_date date,
            collaboration_score integer,
            status text,
            comments text,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
          );

          ALTER TABLE cross_client_collaboration ENABLE ROW LEVEL SECURITY;

          DROP POLICY IF EXISTS "Authenticated users can read collaboration data" ON cross_client_collaboration;
          CREATE POLICY "Authenticated users can read collaboration data"
            ON cross_client_collaboration FOR SELECT TO authenticated USING (true);

          DROP POLICY IF EXISTS "Authenticated users can insert collaboration data" ON cross_client_collaboration;
          CREATE POLICY "Authenticated users can insert collaboration data"
            ON cross_client_collaboration FOR INSERT TO authenticated WITH CHECK (true);

          DROP POLICY IF EXISTS "Authenticated users can update collaboration data" ON cross_client_collaboration;
          CREATE POLICY "Authenticated users can update collaboration data"
            ON cross_client_collaboration FOR UPDATE TO authenticated USING (true);

          DROP POLICY IF EXISTS "Authenticated users can delete collaboration data" ON cross_client_collaboration;
          CREATE POLICY "Authenticated users can delete collaboration data"
            ON cross_client_collaboration FOR DELETE TO authenticated USING (true);

          DROP TRIGGER IF EXISTS update_cross_client_collaboration_updated_at ON cross_client_collaboration;
          CREATE TRIGGER update_cross_client_collaboration_updated_at
            BEFORE UPDATE ON cross_client_collaboration
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

          CREATE INDEX IF NOT EXISTS idx_cross_client_collaboration_product_quarter ON cross_client_collaboration(product, quarter);
        `
      },
      {
        name: 'data_socialization_forums',
        sql: `
          CREATE TABLE IF NOT EXISTS data_socialization_forums (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            product text NOT NULL,
            forum_name text NOT NULL,
            is_active boolean DEFAULT true,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now(),
            UNIQUE(product, forum_name)
          );

          ALTER TABLE data_socialization_forums ENABLE ROW LEVEL SECURITY;

          DROP POLICY IF EXISTS "Authenticated users can read forums" ON data_socialization_forums;
          CREATE POLICY "Authenticated users can read forums"
            ON data_socialization_forums FOR SELECT TO authenticated USING (true);

          DROP POLICY IF EXISTS "Authenticated users can insert forums" ON data_socialization_forums;
          CREATE POLICY "Authenticated users can insert forums"
            ON data_socialization_forums FOR INSERT TO authenticated WITH CHECK (true);

          DROP POLICY IF EXISTS "Authenticated users can update forums" ON data_socialization_forums;
          CREATE POLICY "Authenticated users can update forums"
            ON data_socialization_forums FOR UPDATE TO authenticated USING (true);

          DROP POLICY IF EXISTS "Authenticated users can delete forums" ON data_socialization_forums;
          CREATE POLICY "Authenticated users can delete forums"
            ON data_socialization_forums FOR DELETE TO authenticated USING (true);

          DROP TRIGGER IF EXISTS update_data_socialization_forums_updated_at ON data_socialization_forums;
          CREATE TRIGGER update_data_socialization_forums_updated_at
            BEFORE UPDATE ON data_socialization_forums
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

          CREATE INDEX IF NOT EXISTS idx_data_socialization_forums_product ON data_socialization_forums(product);
        `
      },
      {
        name: 'action_items',
        sql: `
          CREATE TABLE IF NOT EXISTS action_items (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
            product text NOT NULL,
            quarter text NOT NULL,
            text text NOT NULL,
            completed boolean DEFAULT false,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
          );

          ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;

          DROP POLICY IF EXISTS "Users can read own action items" ON action_items;
          CREATE POLICY "Users can read own action items"
            ON action_items FOR SELECT TO authenticated USING (auth.uid() = user_id);

          DROP POLICY IF EXISTS "Users can insert own action items" ON action_items;
          CREATE POLICY "Users can insert own action items"
            ON action_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

          DROP POLICY IF EXISTS "Users can update own action items" ON action_items;
          CREATE POLICY "Users can update own action items"
            ON action_items FOR UPDATE TO authenticated USING (auth.uid() = user_id);

          DROP POLICY IF EXISTS "Users can delete own action items" ON action_items;
          CREATE POLICY "Users can delete own action items"
            ON action_items FOR DELETE TO authenticated USING (auth.uid() = user_id);

          DROP TRIGGER IF EXISTS update_action_items_updated_at ON action_items;
          CREATE TRIGGER update_action_items_updated_at
            BEFORE UPDATE ON action_items
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

          CREATE INDEX IF NOT EXISTS idx_action_items_user_product_quarter ON action_items(user_id, product, quarter);
          CREATE INDEX IF NOT EXISTS idx_action_items_completed ON action_items(completed);
        `
      },
      {
        name: 'dashboard_configs',
        sql: `
          CREATE TABLE IF NOT EXISTS dashboard_configs (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            product text NOT NULL,
            quarter text NOT NULL,
            user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
            widget_settings jsonb NOT NULL DEFAULT '{}',
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now(),
            UNIQUE(product, quarter, user_id)
          );

          ALTER TABLE dashboard_configs ENABLE ROW LEVEL SECURITY;

          DROP POLICY IF EXISTS "Users can read own dashboard configs" ON dashboard_configs;
          CREATE POLICY "Users can read own dashboard configs"
            ON dashboard_configs FOR SELECT TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);

          DROP POLICY IF EXISTS "Users can insert own dashboard configs" ON dashboard_configs;
          CREATE POLICY "Users can insert own dashboard configs"
            ON dashboard_configs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

          DROP POLICY IF EXISTS "Users can update own dashboard configs" ON dashboard_configs;
          CREATE POLICY "Users can update own dashboard configs"
            ON dashboard_configs FOR UPDATE TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);

          DROP POLICY IF EXISTS "Users can delete own dashboard configs" ON dashboard_configs;
          CREATE POLICY "Users can delete own dashboard configs"
            ON dashboard_configs FOR DELETE TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);

          DROP TRIGGER IF EXISTS update_dashboard_configs_updated_at ON dashboard_configs;
          CREATE TRIGGER update_dashboard_configs_updated_at
            BEFORE UPDATE ON dashboard_configs
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

          CREATE INDEX IF NOT EXISTS idx_dashboard_configs_user_product_quarter ON dashboard_configs(user_id, product, quarter);
        `
      }
    ];

    // Create all remaining tables
    for (const table of tables) {
      console.log(`📋 Creating ${table.name} table...`);
      const { error } = await supabase.rpc('exec_sql', { sql: table.sql });
      
      if (error) {
        console.error(`❌ Error creating ${table.name} table:`, error);
      } else {
        console.log(`✅ ${table.name} table created successfully`);
      }
    }

    console.log('🎉 Database setup completed successfully!');
    console.log('📝 All tables have been created with proper RLS policies and triggers.');
    console.log('🔐 Row Level Security is enabled on all tables for data protection.');

  } catch (error) {
    console.error('💥 Fatal error during database setup:', error);
  }
}

// Execute the setup
createTables();