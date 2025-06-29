import { CreateClientForm } from "@/components/create-client-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewClientPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Add a New Client</CardTitle>
          <CardDescription>Create a new client portal with customized onboarding experience</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateClientForm />
        </CardContent>
      </Card>
    </div>
  )
}
