"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Play, Loader2 } from "lucide-react"

interface TableStatus {
  name: string
  exists: boolean
  recordCount?: number
}

interface ScriptStatus {
  name: string
  executed: boolean
  error?: string
}

export function DatabaseStatusCheck() {
  const [tableStatuses, setTableStatuses] = useState<TableStatus[]>([])
  const [scriptStatuses, setScriptStatuses] = useState<ScriptStatus[]>([])
  const [isChecking, setIsChecking] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)

  const checkDatabaseStatus = async () => {
    setIsChecking(true)
    try {
      const response = await fetch("/api/database/status")
      const data = await response.json()
      setTableStatuses(data.tables || [])
      setScriptStatuses(data.scripts || [])
    } catch (error) {
      console.error("Error checking database status:", error)
    } finally {
      setIsChecking(false)
    }
  }

  const executeScript = async (scriptName: string) => {
    setIsExecuting(true)
    try {
      const response = await fetch("/api/database/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script: scriptName }),
      })

      if (response.ok) {
        // Refresh status after execution
        await checkDatabaseStatus()
      } else {
        const error = await response.text()
        console.error("Error executing script:", error)
      }
    } catch (error) {
      console.error("Error executing script:", error)
    } finally {
      setIsExecuting(false)
    }
  }

  const executeAllScripts = async () => {
    setIsExecuting(true)
    try {
      const response = await fetch("/api/database/setup", {
        method: "POST",
      })

      if (response.ok) {
        // Refresh status after execution
        await checkDatabaseStatus()
      } else {
        const error = await response.text()
        console.error("Error executing all scripts:", error)
      }
    } catch (error) {
      console.error("Error executing all scripts:", error)
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Database Status</CardTitle>
          <CardDescription>Check the status of your database tables and execute setup scripts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Button onClick={checkDatabaseStatus} disabled={isChecking} variant="outline">
              {isChecking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                "Check Status"
              )}
            </Button>
            <Button onClick={executeAllScripts} disabled={isExecuting}>
              {isExecuting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run All Scripts
                </>
              )}
            </Button>
          </div>

          {tableStatuses.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Table Status</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {tableStatuses.map((table) => (
                  <div key={table.name} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{table.name}</span>
                    <div className="flex items-center space-x-2">
                      {table.recordCount !== undefined && (
                        <Badge variant="secondary">{table.recordCount} records</Badge>
                      )}
                      {table.exists ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {scriptStatuses.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Script Status</h4>
              <div className="space-y-2">
                {scriptStatuses.map((script) => (
                  <div key={script.name} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{script.name}</span>
                    <div className="flex items-center space-x-2">
                      {script.error && (
                        <Badge variant="destructive" className="text-xs">
                          Error
                        </Badge>
                      )}
                      {script.executed ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => executeScript(script.name)}
                          disabled={isExecuting}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Run
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tableStatuses.length === 0 && scriptStatuses.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Click "Check Status" to see database information</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
