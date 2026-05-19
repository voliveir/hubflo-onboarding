import type { Client } from "@/lib/types"

/** Sentinel for unlimited package entitlements */
export const UNLIMITED = 999

export type SuccessPackageId =
  | "light"
  | "premium"
  | "gold"
  | "elite"
  | "starter"
  | "professional"
  | "enterprise"
  | "no_success"

export interface PackageLimits {
  /** Calls that count toward implementation progress (kickoff excluded when applicable) */
  countableCalls: number
  /** Total onboarding calls included in the package (including kickoff) */
  totalCalls: number
  forms: number
  smartdocs: number
  /** When set, forms + smartdocs share one pool (e.g. Premium: up to 3 templates) */
  templatesCombined: number | null
  integrations: number
  migration: boolean
  slack: boolean
  excludeKickoffFromProgress: boolean
}

export interface SuccessPackageDefinition {
  id: SuccessPackageId
  displayName: string
  emoji: string
  description: string
  priceLabel?: string
  features: string[]
  limits: PackageLimits
  checkmarkStyle: "muted" | "gold" | "dark"
  upgradeLevel: number
}

const LIGHT_FEATURES = [
  "One Zoom call with a product specialist",
  "Help setting up a few forms & templates during your onboarding call",
  "Access to video tutorials",
  "Chat & email support",
]

const PREMIUM_FEATURES = [
  "2 Zoom calls with a product specialist",
  "Workflow mapping & workspace structuring",
  "Up to 3 simple workflows or automations with external apps",
  "Setup of your forms, SmartDocs & workspace templates (up to 3)",
  "Simple data imports",
  "Priority support during onboarding",
]

const ELITE_FEATURES = [
  "Everything in Premium, plus:",
  "Migration assistance (contacts, workspaces, clients)",
  "Custom integration setup (via API or partner tools)",
  "Full onboarding project managed by our team",
  "Advanced external integrations & workflows",
  "Direct access to your account manager via Slack",
]

const ELITE_LIMITS: PackageLimits = {
  countableCalls: UNLIMITED,
  totalCalls: UNLIMITED,
  forms: UNLIMITED,
  smartdocs: UNLIMITED,
  templatesCombined: null,
  integrations: UNLIMITED,
  migration: true,
  slack: true,
  excludeKickoffFromProgress: true,
}

export const SUCCESS_PACKAGES: Record<SuccessPackageId, SuccessPackageDefinition> = {
  light: {
    id: "light",
    displayName: "Light",
    emoji: "🟢",
    description: "Everything you need to get started on your own with support when you need it.",
    priceLabel: "Included",
    features: LIGHT_FEATURES,
    limits: {
      countableCalls: 1,
      totalCalls: 1,
      forms: 0,
      smartdocs: 0,
      templatesCombined: null,
      integrations: 0,
      migration: false,
      slack: false,
      excludeKickoffFromProgress: false,
    },
    checkmarkStyle: "muted",
    upgradeLevel: 1,
  },
  premium: {
    id: "premium",
    displayName: "Premium",
    emoji: "🔵",
    description: "Perfect for teams who want expert guidance and a fast-track setup.",
    features: PREMIUM_FEATURES,
    limits: {
      countableCalls: 2,
      totalCalls: 2,
      forms: 0,
      smartdocs: 0,
      templatesCombined: 3,
      integrations: 3,
      migration: false,
      slack: false,
      excludeKickoffFromProgress: false,
    },
    checkmarkStyle: "gold",
    upgradeLevel: 2,
  },
  gold: {
    id: "gold",
    displayName: "Gold",
    emoji: "🟡",
    description: "Legacy package — same entitlements as Premium with additional call capacity.",
    features: PREMIUM_FEATURES,
    limits: {
      countableCalls: 2,
      totalCalls: 3,
      forms: 0,
      smartdocs: 0,
      templatesCombined: 4,
      integrations: 2,
      migration: false,
      slack: false,
      excludeKickoffFromProgress: true,
    },
    checkmarkStyle: "gold",
    upgradeLevel: 2,
  },
  elite: {
    id: "elite",
    displayName: "Elite",
    emoji: "🔴",
    description: "Best for teams migrating from another tool or needing fully personalized setup.",
    priceLabel: "Custom · starting from $990",
    features: ELITE_FEATURES,
    limits: ELITE_LIMITS,
    checkmarkStyle: "dark",
    upgradeLevel: 3,
  },
  starter: {
    id: "starter",
    displayName: "Starter",
    emoji: "⚪",
    description: "Essential onboarding support",
    features: LIGHT_FEATURES,
    limits: {
      countableCalls: 1,
      totalCalls: 1,
      forms: 1,
      smartdocs: 1,
      templatesCombined: null,
      integrations: 0,
      migration: false,
      slack: false,
      excludeKickoffFromProgress: false,
    },
    checkmarkStyle: "muted",
    upgradeLevel: 1,
  },
  professional: {
    id: "professional",
    displayName: "Professional",
    emoji: "🟣",
    description: "Advanced onboarding support",
    features: PREMIUM_FEATURES,
    limits: {
      countableCalls: 3,
      totalCalls: 3,
      forms: 5,
      smartdocs: 5,
      templatesCombined: null,
      integrations: 3,
      migration: false,
      slack: true,
      excludeKickoffFromProgress: true,
    },
    checkmarkStyle: "gold",
    upgradeLevel: 2,
  },
  enterprise: {
    id: "enterprise",
    displayName: "Enterprise",
    emoji: "🟦",
    description: "Enterprise onboarding",
    features: ELITE_FEATURES,
    limits: ELITE_LIMITS,
    checkmarkStyle: "dark",
    upgradeLevel: 3,
  },
  no_success: {
    id: "no_success",
    displayName: "No Success Package",
    emoji: "⚪",
    description: "Limited onboarding support",
    features: [
      "One onboarding call (CSM will reach out to schedule)",
      "Video tutorials",
      "Chat support",
    ],
    limits: {
      countableCalls: 0,
      totalCalls: 0,
      forms: 0,
      smartdocs: 0,
      templatesCombined: null,
      integrations: 0,
      migration: false,
      slack: false,
      excludeKickoffFromProgress: false,
    },
    checkmarkStyle: "muted",
    upgradeLevel: 0,
  },
}

export function normalizePackage(pkg: string | null | undefined): SuccessPackageId {
  const key = (pkg || "premium").toLowerCase() as SuccessPackageId
  return key in SUCCESS_PACKAGES ? key : "premium"
}

export function getPackageDefinition(pkg: string | null | undefined): SuccessPackageDefinition {
  return SUCCESS_PACKAGES[normalizePackage(pkg)]
}

export function getPackageLimits(pkg: string | null | undefined): PackageLimits {
  return getPackageDefinition(pkg).limits
}

export function isUnlimited(value: number): boolean {
  return value >= UNLIMITED
}

export function getTemplatesCompleted(client: Client): number {
  return (client.forms_setup || 0) + (client.smartdocs_setup || 0)
}

export function getKickoffCallDate(client: Client): string | null | undefined {
  const pkg = normalizePackage(client.success_package)
  switch (pkg) {
    case "premium":
    case "professional":
      return client.premium_first_call_date
    case "gold":
      return client.gold_first_call_date
    case "elite":
    case "enterprise":
      return client.light_onboarding_call_date
    default:
      return null
  }
}

/** Packages that can upgrade in the client portal upsell section */
export const UPGRADE_CATALOG: SuccessPackageDefinition[] = [
  SUCCESS_PACKAGES.light,
  SUCCESS_PACKAGES.premium,
  SUCCESS_PACKAGES.elite,
]

export function getUpgradeOptions(currentPackage: string): SuccessPackageDefinition[] {
  const current = getPackageDefinition(currentPackage)
  return UPGRADE_CATALOG.filter((p) => p.upgradeLevel > current.upgradeLevel)
}

export function getRecommendedUpgrade(currentPackage: string): SuccessPackageDefinition | null {
  const options = getUpgradeOptions(currentPackage)
  if (options.length === 0) return null
  return options.find((p) => p.id === "premium") ?? options[0]
}

export interface ImplementationProgressInput {
  overall: number
  calls: number
  forms: number
  smartdocs: number
  integrations: number
  templates: number
}

export function calculateImplementationProgress(
  client: Client,
  completedCalls: number,
): ImplementationProgressInput {
  const limits = getPackageLimits(client.success_package)
  const templatesCompleted = getTemplatesCompleted(client)

  const callsDenominator = isUnlimited(limits.countableCalls)
    ? Math.max(client.calls_scheduled || 1, 1)
    : limits.countableCalls

  const callsProgress =
    limits.countableCalls === 0
      ? 100
      : isUnlimited(limits.countableCalls)
        ? completedCalls > 0
          ? 100
          : 0
        : Math.round((completedCalls / callsDenominator) * 100)

  let formsProgress = 100
  let smartdocsProgress = 100
  let templatesProgress = 100

  if (limits.templatesCombined != null) {
    templatesProgress =
      limits.templatesCombined === 0
        ? 100
        : Math.round((Math.min(templatesCompleted, limits.templatesCombined) / limits.templatesCombined) * 100)
    formsProgress = templatesProgress
    smartdocsProgress = templatesProgress
  } else {
    if (limits.forms > 0) {
      formsProgress = isUnlimited(limits.forms)
        ? client.forms_setup > 0
          ? 100
          : 0
        : Math.round((client.forms_setup / limits.forms) * 100)
    } else {
      formsProgress = limits.forms === 0 ? 100 : 0
    }

    if (limits.smartdocs > 0) {
      smartdocsProgress = isUnlimited(limits.smartdocs)
        ? client.smartdocs_setup > 0
          ? 100
          : 0
        : Math.round((client.smartdocs_setup / limits.smartdocs) * 100)
    } else {
      smartdocsProgress = limits.smartdocs === 0 ? 100 : 0
    }
  }

  const integrationsProgress =
    limits.integrations === 0
      ? 100
      : isUnlimited(limits.integrations)
        ? client.zapier_integrations_setup > 0
          ? 100
          : 0
        : Math.round((client.zapier_integrations_setup / limits.integrations) * 100)

  let totalTasks = 0
  let completedTasks = 0

  if (limits.countableCalls > 0) {
    const callCap = isUnlimited(limits.countableCalls)
      ? Math.max(client.calls_scheduled || 1, 1)
      : limits.countableCalls
    totalTasks += callCap
    completedTasks += Math.min(completedCalls, callCap)
  }

  if (limits.templatesCombined != null && limits.templatesCombined > 0) {
    totalTasks += limits.templatesCombined
    completedTasks += Math.min(templatesCompleted, limits.templatesCombined)
  } else {
    if (limits.forms > 0) {
      const cap = isUnlimited(limits.forms) ? Math.max(client.forms_setup, 1) : limits.forms
      totalTasks += cap
      completedTasks += Math.min(client.forms_setup, cap)
    }
    if (limits.smartdocs > 0) {
      const cap = isUnlimited(limits.smartdocs) ? Math.max(client.smartdocs_setup, 1) : limits.smartdocs
      totalTasks += cap
      completedTasks += Math.min(client.smartdocs_setup, cap)
    }
  }

  if (limits.integrations > 0) {
    const cap = isUnlimited(limits.integrations)
      ? Math.max(client.zapier_integrations_setup, 1)
      : limits.integrations
    totalTasks += cap
    completedTasks += Math.min(client.zapier_integrations_setup, cap)
  }

  if (limits.migration) {
    totalTasks += 1
    if (client.migration_completed) completedTasks += 1
  }

  if (limits.slack) {
    totalTasks += 1
    if (client.slack_access_granted) completedTasks += 1
  }

  const overall = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return {
    overall,
    calls: Math.min(callsProgress, 100),
    forms: Math.min(formsProgress, 100),
    smartdocs: Math.min(smartdocsProgress, 100),
    integrations: Math.min(integrationsProgress, 100),
    templates: Math.min(templatesProgress, 100),
  }
}
