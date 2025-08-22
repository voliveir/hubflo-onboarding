import { NextResponse } from "next/server"
import { Client } from 'pg'

export async function PATCH(req: Request) {
  const { clientId, updates } = await req.json()
  console.log('Direct API received request:', { clientId, updates });
  
  if (!clientId || !updates || typeof updates !== 'object') {
    return NextResponse.json({ success: false, error: "Missing clientId or updates object" }, { status: 400 })
  }

  // Get database connection details from environment
  const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  
  if (!connectionString) {
    console.error('No database connection string found');
    return NextResponse.json({ success: false, error: "Database connection not configured" }, { status: 500 })
  }

  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database directly');

    // Build the update query
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (updates.white_label_client_approval_status) {
      updateFields.push(`white_label_client_approval_status = $${paramCount++}`);
      updateValues.push(updates.white_label_client_approval_status);
    }

    if (updates.white_label_client_approval_at) {
      updateFields.push(`white_label_client_approval_at = $${paramCount++}`);
      updateValues.push(updates.white_label_client_approval_at);
    }

    if (updates.white_label_approval_feedback) {
      updateFields.push(`white_label_approval_feedback = $${paramCount++}`);
      updateValues.push(updates.white_label_approval_feedback);
    }

    if (updates.white_label_approval_feedback_at) {
      updateFields.push(`white_label_approval_feedback_at = $${paramCount++}`);
      updateValues.push(updates.white_label_approval_feedback_at);
    }

    if (updates.white_label_implementation_manager_notified_at) {
      updateFields.push(`white_label_implementation_manager_notified_at = $${paramCount++}`);
      updateValues.push(updates.white_label_implementation_manager_notified_at);
    }

    updateFields.push(`updated_at = $${paramCount++}`);
    updateValues.push(new Date().toISOString());

    updateValues.push(clientId); // For WHERE clause

    const sql = `
      UPDATE clients 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    console.log('Direct SQL Query:', sql);
    console.log('Direct SQL Values:', updateValues);

    const result = await client.query(sql, updateValues);
    
    console.log('Direct SQL update successful:', result.rows[0]);
    return NextResponse.json({ success: true, data: result.rows[0] })

  } catch (error: any) {
    console.error('Direct database error:', error);
    return NextResponse.json({ success: false, error: error?.message || "Unknown error" }, { status: 500 })
  } finally {
    await client.end();
  }
}
