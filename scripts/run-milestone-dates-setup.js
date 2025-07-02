const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMilestoneDatesSetup() {
  try {
    console.log('Starting milestone dates setup...')
    
    // Add the new columns one by one
    const columns = [
      'light_onboarding_call_date',
      'premium_first_call_date',
      'premium_second_call_date',
      'gold_first_call_date',
      'gold_second_call_date',
      'gold_third_call_date',
      'elite_configurations_started_date',
      'elite_integrations_started_date',
      'elite_verification_completed_date'
    ]
    
    for (const column of columns) {
      console.log(`Adding column: ${column}`)
      
      // Try to add the column using a direct SQL query
      const { error } = await supabase
        .from('clients')
        .select('id')
        .limit(1)
        .then(() => {
          // If the select works, try to add the column
          return supabase.rpc('add_column_if_not_exists', {
            table_name: 'clients',
            column_name: column,
            column_type: 'DATE'
          })
        })
      
      if (error) {
        console.log(`Column ${column} might already exist or couldn't be added:`, error.message)
      } else {
        console.log(`Column ${column} added successfully`)
      }
    }
    
    console.log('Milestone dates setup completed!')
    console.log('Note: If columns already exist, this is normal.')
    
  } catch (error) {
    console.error('Error during milestone dates setup:', error)
    console.log('You may need to manually add the columns to your database.')
  }
}

// Run the setup
runMilestoneDatesSetup() 