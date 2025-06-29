"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/hooks/use-toast"
import {
  getSettings,
  updateSettings,
  testEmailConnection,
  testDatabaseConnection,
  type PlatformSettings,
} from "@/lib/database"
import {
  Settings,
  Palette,
  Mail,
  Shield,
  Database,
  Save,
  TestTube,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react"

export function SettingsManager() {
  const [settings, setSettings] = useState<PlatformSettings>({
    platform_name: "Hubflo Onboarding Platform",
    platform_url: "https://localhost:3000",
    support_email: "support@hubflo.com",
    admin_email: "admin@hubflo.com",
    logo_url: "",
    primary_color: "#3B82F6",
    secondary_color: "#1E40AF",
    enable_notifications: true,
    enable_client_registration: false,
    default_package: "premium",
    smtp_host: "",
    smtp_port: 587,
    smtp_username: "",
    smtp_password: "",
    smtp_secure: true,
    maintenance_mode: false,
    maintenance_message: "We are currently performing maintenance. Please check back soon.",
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingEmail, setTestingEmail] = useState(false)
  const [testingDatabase, setTestingDatabase] = useState(false)
  const [emailTestResult, setEmailTestResult] = useState<boolean | null>(null)
  const [databaseTestResult, setDatabaseTestResult] = useState<boolean | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const data = await getSettings()
      if (data) {
        setSettings(data)
      }
    } catch (error) {
      console.error("Error loading settings:", error)
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateSettings(settings)
      toast({
        title: "Success",
        description: "Settings saved successfully",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleTestEmail = async () => {
    setTestingEmail(true)
    try {
      const result = await testEmailConnection(settings)
      setEmailTestResult(result)
      toast({
        title: result ? "Success" : "Failed",
        description: result ? "Email connection successful" : "Email connection failed",
        variant: result ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Error testing email:", error)
      setEmailTestResult(false)
      toast({
        title: "Error",
        description: "Failed to test email connection",
        variant: "destructive",
      })
    } finally {
      setTestingEmail(false)
    }
  }

  const handleTestDatabase = async () => {
    setTestingDatabase(true)
    try {
      const result = await testDatabaseConnection()
      setDatabaseTestResult(result)
      toast({
        title: result ? "Success" : "Failed",
        description: result ? "Database connection successful" : "Database connection failed",
        variant: result ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Error testing database:", error)
      setDatabaseTestResult(false)
      toast({
        title: "Error",
        description: "Failed to test database connection",
        variant: "destructive",
      })
    } finally {
      setTestingDatabase(false)
    }
  }

  const updateSetting = (key: keyof PlatformSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Platform Configuration</h2>
          <p className="text-gray-600">Manage your platform settings and preferences</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic platform configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform_name">Platform Name</Label>
                  <Input
                    id="platform_name"
                    value={settings.platform_name}
                    onChange={(e) => updateSetting("platform_name", e.target.value)}
                    placeholder="Hubflo Onboarding Platform"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform_url">Platform URL</Label>
                  <Input
                    id="platform_url"
                    value={settings.platform_url}
                    onChange={(e) => updateSetting("platform_url", e.target.value)}
                    placeholder="https://your-domain.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="support_email">Support Email</Label>
                  <Input
                    id="support_email"
                    type="email"
                    value={settings.support_email}
                    onChange={(e) => updateSetting("support_email", e.target.value)}
                    placeholder="support@hubflo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin_email">Admin Email</Label>
                  <Input
                    id="admin_email"
                    type="email"
                    value={settings.admin_email}
                    onChange={(e) => updateSetting("admin_email", e.target.value)}
                    placeholder="admin@hubflo.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default_package">Default Package</Label>
                <select
                  id="default_package"
                  value={settings.default_package}
                  onChange={(e) => updateSetting("default_package", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="light">Light</option>
                  <option value="premium">Premium</option>
                  <option value="gold">Gold</option>
                  <option value="elite">Elite</option>
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enable_notifications">Enable Notifications</Label>
                    <p className="text-sm text-gray-600">Send email notifications to clients</p>
                  </div>
                  <Switch
                    id="enable_notifications"
                    checked={settings.enable_notifications}
                    onCheckedChange={(checked) => updateSetting("enable_notifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enable_client_registration">Enable Client Registration</Label>
                    <p className="text-sm text-gray-600">Allow clients to self-register</p>
                  </div>
                  <Switch
                    id="enable_client_registration"
                    checked={settings.enable_client_registration}
                    onCheckedChange={(checked) => updateSetting("enable_client_registration", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Branding & Appearance</CardTitle>
              <CardDescription>Customize the look and feel of your platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  value={settings.logo_url || ""}
                  onChange={(e) => updateSetting("logo_url", e.target.value)}
                  placeholder="https://your-domain.com/logo.png"
                />
                {settings.logo_url && (
                  <div className="mt-2">
                    <img
                      src={settings.logo_url || "/placeholder.svg"}
                      alt="Platform Logo"
                      className="h-16 w-auto border rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="primary_color"
                      type="color"
                      value={settings.primary_color}
                      onChange={(e) => updateSetting("primary_color", e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={settings.primary_color}
                      onChange={(e) => updateSetting("primary_color", e.target.value)}
                      placeholder="#3B82F6"
                      className="flex-1"
                    />
                  </div>
                  <div className="w-full h-8 rounded border" style={{ backgroundColor: settings.primary_color }} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary_color">Secondary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="secondary_color"
                      type="color"
                      value={settings.secondary_color}
                      onChange={(e) => updateSetting("secondary_color", e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={settings.secondary_color}
                      onChange={(e) => updateSetting("secondary_color", e.target.value)}
                      placeholder="#1E40AF"
                      className="flex-1"
                    />
                  </div>
                  <div className="w-full h-8 rounded border" style={{ backgroundColor: settings.secondary_color }} />
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Color changes will be applied after saving and may require a page refresh to take full effect.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Configure SMTP settings for sending emails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp_host">SMTP Host</Label>
                  <Input
                    id="smtp_host"
                    value={settings.smtp_host}
                    onChange={(e) => updateSetting("smtp_host", e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_port">SMTP Port</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    value={settings.smtp_port}
                    onChange={(e) => updateSetting("smtp_port", Number.parseInt(e.target.value))}
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp_username">SMTP Username</Label>
                  <Input
                    id="smtp_username"
                    value={settings.smtp_username}
                    onChange={(e) => updateSetting("smtp_username", e.target.value)}
                    placeholder="your-email@gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_password">SMTP Password</Label>
                  <Input
                    id="smtp_password"
                    type="password"
                    value={settings.smtp_password}
                    onChange={(e) => updateSetting("smtp_password", e.target.value)}
                    placeholder="your-app-password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="smtp_secure">Use Secure Connection (TLS)</Label>
                  <p className="text-sm text-gray-600">Enable TLS encryption for SMTP</p>
                </div>
                <Switch
                  id="smtp_secure"
                  checked={settings.smtp_secure}
                  onCheckedChange={(checked) => updateSetting("smtp_secure", checked)}
                />
              </div>

              <div className="flex items-center gap-4 pt-4 border-t">
                <Button onClick={handleTestEmail} disabled={testingEmail} variant="outline">
                  {testingEmail ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <TestTube className="h-4 w-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>

                {emailTestResult !== null && (
                  <Badge variant={emailTestResult ? "default" : "destructive"}>
                    {emailTestResult ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Failed
                      </>
                    )}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage security and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Security features are currently managed through your hosting provider and database configuration.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Database Security</h4>
                    <p className="text-sm text-gray-600">Row Level Security (RLS) enabled</p>
                  </div>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">HTTPS Encryption</h4>
                    <p className="text-sm text-gray-600">SSL/TLS encryption for all connections</p>
                  </div>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Environment Variables</h4>
                    <p className="text-sm text-gray-600">Sensitive data stored securely</p>
                  </div>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>System maintenance and diagnostics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
                  <p className="text-sm text-gray-600">Put the platform in maintenance mode</p>
                </div>
                <Switch
                  id="maintenance_mode"
                  checked={settings.maintenance_mode}
                  onCheckedChange={(checked) => updateSetting("maintenance_mode", checked)}
                />
              </div>

              {settings.maintenance_mode && (
                <div className="space-y-2">
                  <Label htmlFor="maintenance_message">Maintenance Message</Label>
                  <Textarea
                    id="maintenance_message"
                    value={settings.maintenance_message}
                    onChange={(e) => updateSetting("maintenance_message", e.target.value)}
                    placeholder="We are currently performing maintenance..."
                    rows={3}
                  />
                </div>
              )}

              <div className="pt-4 border-t space-y-4">
                <h4 className="font-medium">System Diagnostics</h4>

                <div className="flex items-center gap-4">
                  <Button onClick={handleTestDatabase} disabled={testingDatabase} variant="outline">
                    {testingDatabase ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Database className="h-4 w-4 mr-2" />
                        Test Database
                      </>
                    )}
                  </Button>

                  {databaseTestResult !== null && (
                    <Badge variant={databaseTestResult ? "default" : "destructive"}>
                      {databaseTestResult ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Connected
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Failed
                        </>
                      )}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
