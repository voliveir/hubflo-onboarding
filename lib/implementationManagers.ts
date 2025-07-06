import { supabase } from "@/lib/supabase";

export interface ImplementationManager {
  id: string;
  manager_id: string;
  name: string;
  calendar_contact_success: string;
  calendar_schedule_call: string;
  calendar_integrations_call: string;
  calendar_upgrade_consultation: string;
  created_at: string;
  updated_at: string;
}

export async function getImplementationManagers(): Promise<ImplementationManager[]> {
  const { data, error } = await supabase.from("implementation_managers").select("*");
  if (error) throw error;
  return data as ImplementationManager[];
}

export async function getImplementationManagerById(manager_id: string): Promise<ImplementationManager | null> {
  const { data, error } = await supabase
    .from("implementation_managers")
    .select("*")
    .eq("manager_id", manager_id)
    .single();
  if (error) return null;
  return data as ImplementationManager;
}

export async function updateImplementationManager(manager_id: string, updates: Partial<ImplementationManager>): Promise<ImplementationManager> {
  const { data, error } = await supabase
    .from("implementation_managers")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("manager_id", manager_id)
    .select()
    .single();
  if (error) throw error;
  return data as ImplementationManager;
}

export const IMPLEMENTATION_MANAGERS = {
  vanessa: {
    name: 'Vanessa Oliveira',
    calendars: {
      onboarding: 'https://calendly.com/vanessa-hubflo/onboarding-kickoff-with-hubflo-clone',
      integrations: 'https://calendly.com/vanessa-hubflo/integration-call',
    },
  },
  vishal: {
    name: 'Vishal Jassal',
    calendars: {
      onboarding: 'https://calendly.com/vishal-hubflo/onboarding-kickoff',
      integrations: 'https://calendly.com/vishal-hubflo/integration-call',
    },
  },
} as const; 