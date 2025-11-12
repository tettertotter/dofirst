#!/usr/bin/env node
/**
 * Seed test tasks for testing swipe gestures
 * Run with: node scripts/seed-test-tasks.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables from .env.local
const envPath = path.join(__dirname, '../.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1]] = match[2];
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seedTestTasks() {
  try {
    console.log('🌱 Seeding test tasks...\n');

    // Get the first user
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    if (userError || !users || users.users.length === 0) {
      console.error('❌ No users found. Please sign up first.');
      process.exit(1);
    }
    const userId = users.users[0].id;
    console.log(`✓ Found user: ${userId}`);

    // Get the first pool for that user
    const { data: members, error: memberError } = await supabase
      .from('pool_members')
      .select('pool_id')
      .eq('user_id', userId)
      .limit(1);

    if (memberError || !members || members.length === 0) {
      console.error('❌ No pool found for user. Please create a pool first.');
      process.exit(1);
    }
    const poolId = members[0].pool_id;
    console.log(`✓ Found pool: ${poolId}\n`);

    const now = new Date();
    const testTasks = [
      // Priority 5 (Urgent)
      { title: '[TEST] Fix critical production bug', description: 'System is down, users cannot login', priority: 5, due_at: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(), visibility: 'household' },
      { title: '[TEST] Review security vulnerability', description: 'CVE reported in main dependency', priority: 5, due_at: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(), visibility: 'household' },

      // Priority 4 (High)
      { title: '[TEST] Prepare quarterly presentation', description: 'Q4 results presentation for stakeholders', priority: 4, due_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), visibility: 'work' },
      { title: '[TEST] Call insurance company', description: 'Discuss coverage options for home', priority: 4, due_at: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(), visibility: 'owner_only' },
      { title: '[TEST] Submit expense report', description: 'Last month\'s business expenses', priority: 4, due_at: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), visibility: 'work' },

      // Priority 3 (Medium)
      { title: '[TEST] Update project documentation', description: 'Add API examples and usage guides', priority: 3, due_at: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), visibility: 'work' },
      { title: '[TEST] Schedule dentist appointment', description: 'Annual cleaning and checkup', priority: 3, due_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), visibility: 'household' },
      { title: '[TEST] Research vacation destinations', description: 'Summer 2025 family trip options', priority: 3, due_at: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(), visibility: 'household' },
      { title: '[TEST] Order new office supplies', description: 'Pens, notebooks, sticky notes', priority: 3, due_at: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), visibility: 'work' },

      // Priority 2 (Low)
      { title: '[TEST] Organize photo library', description: 'Sort and tag photos from last year', priority: 2, due_at: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(), visibility: 'owner_only' },
      { title: '[TEST] Read technical book', description: 'Designing Data-Intensive Applications', priority: 2, due_at: null, visibility: 'owner_only' },
      { title: '[TEST] Clean out garage', description: 'Donate unused items, organize tools', priority: 2, due_at: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString(), visibility: 'household' },

      // Priority 1 (Someday)
      { title: '[TEST] Learn new programming language', description: 'Try Rust or Go for a side project', priority: 1, due_at: null, visibility: 'owner_only' },
      { title: '[TEST] Start meditation practice', description: 'Daily 10-minute meditation habit', priority: 1, due_at: null, visibility: 'owner_only' },
      { title: '[TEST] Paint bedroom walls', description: 'Choose color and schedule painting', priority: 1, due_at: null, visibility: 'household' }
    ];

    // Insert all test tasks
    const tasksToInsert = testTasks.map(task => ({
      pool_id: poolId,
      created_by: userId,
      ...task,
      status: 'open',
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    }));

    const { data, error } = await supabase
      .from('tasks')
      .insert(tasksToInsert)
      .select('id');

    if (error) {
      console.error('❌ Error inserting tasks:', error);
      process.exit(1);
    }

    console.log(`✅ Successfully created ${data.length} test tasks!\n`);
    console.log('Test tasks created with [TEST] prefix:');
    console.log('  • 2 × Priority 5 (Urgent) - due in hours');
    console.log('  • 3 × Priority 4 (High) - due in 1-2 days');
    console.log('  • 4 × Priority 3 (Medium) - due in days/weeks');
    console.log('  • 3 × Priority 2 (Low) - due in weeks or no due date');
    console.log('  • 3 × Priority 1 (Someday) - no due dates\n');
    console.log('🎉 Visit http://localhost:3000/pool to test swipe gestures!');

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

seedTestTasks();
