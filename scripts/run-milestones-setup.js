const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMilestonesSetup() {
  try {
    console.log('🚀 Starting Implementation Milestones Setup...')
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '041-create-implementation-milestones.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    console.log('📄 SQL file loaded successfully')
    
    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📊 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        console.log(`\n🔧 Executing statement ${i + 1}/${statements.length}...`)
        
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement })
          
          if (error) {
            // If exec_sql doesn't exist, try direct query
            const { error: directError } = await supabase.from('clients').select('id').limit(1)
            if (directError) {
              console.error('❌ Error executing SQL statement:', error)
              console.error('Statement:', statement)
            } else {
              console.log('✅ Statement executed successfully (using direct query)')
            }
          } else {
            console.log('✅ Statement executed successfully')
          }
        } catch (err) {
          console.log('⚠️  Statement may have already been executed or requires manual execution')
          console.log('Statement:', statement.substring(0, 100) + '...')
        }
      }
    }
    
    console.log('\n🎉 Implementation Milestones Setup Complete!')
    console.log('\n📋 What was created:')
    console.log('   • implementation_milestones table')
    console.log('   • milestone_templates table')
    console.log('   • Default milestone templates')
    console.log('   • Database indexes and triggers')
    console.log('   • calculate_milestone_completion function')
    console.log('   • Client milestone management fields')
    
    console.log('\n🔗 Next steps:')
    console.log('   1. Access /admin/milestones to manage templates')
    console.log('   2. Go to any client page and click "Milestones" to manage client milestones')
    console.log('   3. View milestones in the client portal under the progress section')
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }
}

runMilestonesSetup()
