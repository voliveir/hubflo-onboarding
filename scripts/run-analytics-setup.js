const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runAnalyticsSetup() {
  try {
    console.log('🚀 Setting up Analytics System...')
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '027-create-analytics-system.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`)
          const { error } = await supabase.rpc('exec_sql', { sql: statement })
          
          if (error) {
            // Some statements might fail if tables already exist, which is okay
            if (error.message.includes('already exists') || error.message.includes('duplicate key')) {
              console.log(`⚠️  Statement ${i + 1} skipped (already exists): ${error.message}`)
            } else {
              console.error(`❌ Error executing statement ${i + 1}:`, error.message)
            }
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`)
          }
        } catch (err) {
          console.error(`❌ Error executing statement ${i + 1}:`, err.message)
        }
      }
    }
    
    console.log('🎉 Analytics system setup completed!')
    console.log('')
    console.log('📊 Analytics features now available:')
    console.log('   • Client journey analytics')
    console.log('   • Conversion rate tracking')
    console.log('   • Integration adoption metrics')
    console.log('   • Feature usage statistics')
    console.log('   • Revenue impact tracking')
    console.log('   • Client satisfaction scores')
    console.log('')
    console.log('🔗 Access analytics at: /admin/analytics')
    
  } catch (error) {
    console.error('❌ Failed to setup analytics system:', error)
    process.exit(1)
  }
}

runAnalyticsSetup() 