"use client"

import React from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useReveal } from "@/hooks/useReveal"
import { cn } from "@/lib/utils"
import {
  UserPlus,
  FileText,
  FileSignature,
  CreditCard,
  Layout,
  Send,
  ListChecks,
  FolderOpen,
  CheckCircle,
  MessageSquare,
  Calendar,
  Star,
  BarChart3,
  Settings,
  Users,
  Briefcase,
  Camera,
  Target,
  Calculator,
} from "lucide-react"

const INDUSTRY_WORKFLOWS = {
  law: {
    title: "Law Firms",
    description: "From proposal to final billing, streamline every step of your legal client journey.",
    nodes: [
      { key: "proposal", label: "Proposal & Retainer", subtext: "Sent using SmartDocs with e-signature + optional payment.", icon: <FileSignature className="w-6 h-6 text-brand-gold" />, color: "bg-brand-gold/20 border-brand-gold/40" },
      { key: "intake", label: "Client Intake", subtext: "Intake Form embedded in portal to gather legal details.", icon: <FileText className="w-6 h-6 text-brand-gold" />, color: "bg-brand-gold/20 border-brand-gold/40" },
      { key: "onboarding", label: "Onboarding Tasks", subtext: "Use Tasks to request documents and guide client steps.", icon: <ListChecks className="w-6 h-6 text-brand-gold" />, color: "bg-brand-gold/20 border-brand-gold/40" },
      { key: "files", label: "Case File Exchange", subtext: "Folders for secure document uploads and sharing.", icon: <FolderOpen className="w-6 h-6 text-brand-gold" />, color: "bg-brand-gold/20 border-brand-gold/40" },
      { key: "communication", label: "Ongoing Communication", subtext: "Via Portal Messaging and Task comments.", icon: <MessageSquare className="w-6 h-6 text-brand-gold" />, color: "bg-brand-gold/20 border-brand-gold/40" },
      { key: "final", label: "Final Deliverables & Billing", subtext: "Final docs shared via Folder, Invoice sent through Hubflo.", icon: <CheckCircle className="w-6 h-6 text-brand-gold" />, color: "bg-brand-gold/20 border-brand-gold/40" },
    ],
    previewUrl: "https://example.com/law-firm-portal",
  },
  consulting: {
    title: "Consulting Firms",
    description: "Guide clients from proposal to project delivery with transparent collaboration.",
    nodes: [
      { key: "proposal", label: "Proposal & Contract", subtext: "Delivered through SmartDocs with scope and agreement.", icon: <FileSignature className="w-6 h-6 text-brand-gold" />, color: "bg-brand-gold/20 border-brand-gold/40" },
      { key: "brief", label: "Client Brief Collection", subtext: "Submitted via Form, triggers workspace setup.", icon: <FileText className="w-6 h-6 text-brand-gold" />, color: "bg-brand-gold/20 border-brand-gold/40" },
      { key: "kickoff", label: "Kickoff Tasks & Timeline", subtext: "Assigned via Tasks and client Checklist.", icon: <Calendar className="w-6 h-6 text-brand-gold" />, color: "bg-brand-gold/20 border-brand-gold/40" },
      { key: "collaboration", label: "Collaboration & File Sharing", subtext: "Centralized in Folders with milestone tracking via Tasks.", icon: <FolderOpen className="w-6 h-6 text-brand-gold" />, color: "bg-brand-gold/20 border-brand-gold/40" },
      { key: "status", label: "Status Updates & Calls", subtext: "Managed through Tasks and embedded links.", icon: <MessageSquare className="w-6 h-6 text-brand-gold" />, color: "bg-brand-gold/20 border-brand-gold/40" },
      { key: "summary", label: "Final Summary", subtext: "Shared as a SmartDoc or in Portal Files.", icon: <CheckCircle className="w-6 h-6 text-brand-gold" />, color: "bg-brand-gold/20 border-brand-gold/40" },
    ],
    previewUrl: "https://example.com/consulting-portal",
  },
  media: {
    title: "Media & Production",
    description: "Manage creative projects from brief to delivery with seamless asset sharing.",
    nodes: [
      { key: "brief", label: "Creative Brief & Proposal", subtext: "Combined in a SmartDoc with options and approvals.", icon: <Camera className="w-6 h-6 text-brand-gold" />, color: "bg-brand-gold/20 border-brand-gold/40" },
      { key: "onboarding", label: "Client Onboarding", subtext: "Info gathered via Form, key steps outlined in Tasks.", icon: <Users className="w-6 h-6 text-brand-gold" />, color: "bg-brand-gold/20 border-brand-gold/40" },
      { key: "assets", label: "Asset Uploads & Review", subtext: "Shared using Folders, reviewed via Task comments.", icon: <FolderOpen className="w-6 h-6 text-brand-gold" />, color: "bg-brand-gold/20 border-brand-gold/40" },
      { key: "milestones", label: "Project Milestones", subtext: "Tracked via Task lists for each production stage.", icon: <ListChecks className="w-6 h-6 text-brand-gold" />, color: "bg-brand-gold/20 border-brand-gold/40" },
      { key: "delivery", label: "Delivery", subtext: "Final files shared in Folders, feedback collected via Form.", icon: <CheckCircle className="w-6 h-6 text-brand-gold" />, color: "bg-brand-gold/20 border-brand-gold/40" },
      { key: "invoicing", label: "Invoicing & Feedback", subtext: "Sent through Invoice, testimonial via Form.", icon: <CreditCard className="w-6 h-6 text-brand-gold" />, color: "bg-brand-gold/20 border-brand-gold/40" },
    ],
    previewUrl: "https://example.com/media-portal",
  },
  marketing: {
    title: "Marketing Agencies",
    description: "Onboard clients, manage campaigns, and drive renewals with integrated workflows.",
    nodes: [
      { key: "proposal", label: "Proposal & Package Selection", subtext: "Shared via SmartDoc with upsell logic.", icon: <Target className="w-6 h-6 text-brand-gold" />, color: "bg-brand-gold/20 border-brand-gold/40" },
      { key: "intake", label: "Client Intake & Access", subtext: "Form to gather logins, assets, branding.", icon: <Users className="w-6 h-6 text-brand-gold" />, color: "bg-brand-gold/20 border-brand-gold/40" },
      { key: "onboarding", label: "Onboarding Checklist", subtext: "Step-by-step via Tasks, progress visible in Portal.", icon: <ListChecks className="w-6 h-6 text-brand-gold" />, color: "bg-brand-gold/20 border-brand-gold/40" },
      { key: "collaboration", label: "Ongoing Collaboration", subtext: "Tasks, Folders, and Comments to manage campaign work.", icon: <MessageSquare className="w-6 h-6 text-brand-gold" />, color: "bg-brand-gold/20 border-brand-gold/40" },
      { key: "deliverables", label: "Monthly Deliverables", subtext: "Shared via Folders or embedded in SmartDocs.", icon: <FolderOpen className="w-6 h-6 text-brand-gold" />, color: "bg-brand-gold/20 border-brand-gold/40" },
      { key: "renewals", label: "Renewals/Upsells", subtext: "Triggered via SmartDoc, automated follow-up with Tasks.", icon: <BarChart3 className="w-6 h-6 text-brand-gold" />, color: "bg-brand-gold/20 border-brand-gold/40" },
    ],
    previewUrl: "https://example.com/marketing-portal",
  },
  accounting: {
    title: "Accounting & Financial Services",
    description: "Simplify document collection, ongoing work, and year-end processes.",
    nodes: [
      { key: "agreement", label: "Service Agreement", subtext: "Delivered through SmartDocs with optional billing.", icon: <FileSignature className="w-6 h-6 text-brand-gold" />, color: "bg-brand-gold/20 border-brand-gold/40" },
      { key: "onboarding", label: "Client Onboarding", subtext: "Forms to collect entity/tax info, workspace auto-setup.", icon: <Users className="w-6 h-6 text-brand-gold" />, color: "bg-brand-gold/20 border-brand-gold/40" },
      { key: "documents", label: "Document Collection", subtext: "Managed via Tasks and Folders.", icon: <FolderOpen className="w-6 h-6 text-brand-gold" />, color: "bg-brand-gold/20 border-brand-gold/40" },
      { key: "ongoing", label: "Ongoing Work", subtext: "Recurring Tasks and Files for monthly bookkeeping or tax.", icon: <Calculator className="w-6 h-6 text-brand-gold" />, color: "bg-brand-gold/20 border-brand-gold/40" },
      { key: "communication", label: "Communication", subtext: "All inside the Client Portal with optional reminders.", icon: <MessageSquare className="w-6 h-6 text-brand-gold" />, color: "bg-brand-gold/20 border-brand-gold/40" },
      { key: "yearEnd", label: "Year-End & Renewal", subtext: "Final docs in Folder, renewal proposal via SmartDoc.", icon: <CheckCircle className="w-6 h-6 text-brand-gold" />, color: "bg-brand-gold/20 border-brand-gold/40" },
    ],
    previewUrl: "https://example.com/accounting-portal",
  },
}

function WorkflowBoard({ workflow }: { workflow: typeof INDUSTRY_WORKFLOWS.law }) {
  // Responsive node layout: nodes are spaced evenly horizontally, centered vertically
  const nodeCount = workflow.nodes.length
  return (
    <div className="relative w-screen left-1/2 right-1/2 -translate-x-1/2 h-96 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl border border-white/20 overflow-visible my-8 shadow-xl">
      {/* Grid background */}
      <div 
        className="absolute inset-0 opacity-6 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      {/* SVG for arrows */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
        {workflow.nodes.slice(0, -1).map((from, idx) => {
          const to = workflow.nodes[idx + 1]
          // Calculate node center positions
          const fromX = ((idx + 0.5) / nodeCount) * 100
          const toX = ((idx + 1.5) / nodeCount) * 100
          const y = 40
          return (
            <g key={from.key + '-' + to.key}>
              <line
                x1={`${fromX}%`}
                y1={`${y + 12}%`}
                x2={`${toX}%`}
                y2={`${y + 12}%`}
                stroke="#ECB22D"
                strokeWidth={1}
                strokeOpacity={0.4}
                markerEnd="url(#arrowhead)"
              />
            </g>
          )
        })}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="10"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#ECB22D" fillOpacity={0.4} />
          </marker>
        </defs>
      </svg>
      {/* Workflow nodes */}
      {workflow.nodes.map((node, idx) => {
        const left = ((idx + 0.5) / nodeCount) * 100
        return (
          <div
            key={node.key}
            className={`absolute flex flex-col items-center justify-center shadow-xl border ${node.color} rounded-2xl px-4 py-3 transition-all duration-200 hover:scale-105 hover:shadow-2xl`}
            style={{
              left: `${left}%`,
              top: '40%',
              width: `calc(90vw/${nodeCount} - 1rem)`,
              minWidth: 120,
              maxWidth: 220,
              zIndex: 10,
              transform: 'translate(-50%, -50%)',
              backdropFilter: 'blur(8px)',
              background: 'rgba(255,255,255,0.1)',
            }}
          >
            <div className="mb-1">{node.icon}</div>
            <div className="font-semibold text-white text-center text-base leading-tight">{node.label}</div>
            <div className="text-xs text-white/80 text-center mt-1 leading-snug">{node.subtext}</div>
          </div>
        )
      })}
    </div>
  )
}

export function IndustryWorkflows() {
  const { ref, isVisible } = useReveal()

  return (
    <section ref={ref} className={cn("py-16 px-0 w-full", isVisible && "animate-fade-in-up")}>
      <div className="w-full max-w-full">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">
            Visual Workflows by Industry
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            Explore how different industries use the Hubflo client portal to streamline onboarding, collaboration, and project delivery.
          </p>
        </div>
        <Tabs defaultValue="law" className="w-full">
          <TabsList className="flex flex-wrap justify-center gap-2 mb-8 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
            {Object.entries(INDUSTRY_WORKFLOWS).map(([key, workflow]) => (
              <TabsTrigger
                key={key}
                value={key}
                className="min-w-[140px] text-white data-[state=active]:bg-brand-gold data-[state=active]:text-brand-DEFAULT rounded-xl font-semibold transition-all shadow-sm"
              >
                {workflow.title}
              </TabsTrigger>
            ))}
          </TabsList>
          {Object.entries(INDUSTRY_WORKFLOWS).map(([key, workflow]) => (
            <TabsContent key={key} value={key} className="">
              <div className="w-full mb-8">
                <h3 className="text-2xl font-semibold text-white mb-2 text-center">{workflow.title}</h3>
                <p className="text-white/80 mb-6 text-center">{workflow.description}</p>
                {/* Workflow Board */}
                <WorkflowBoard workflow={workflow} />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
} 