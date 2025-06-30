"use client"

import React, { useCallback, useEffect, useState, useRef } from "react"
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
  NodeTypes,
  useReactFlow,
  Handle,
  Position,
  ConnectionMode,
} from "reactflow"
import "reactflow/dist/style.css"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { CheckCircle, FileText, Calendar, ClipboardList, Users, FileSignature, UploadCloud, Zap, ListChecks, Bell, UserCheck, GitBranch, Flag, HelpCircle } from "lucide-react"
import isEqual from "lodash.isequal"

export interface WorkflowBuilderProps {
  clientId: string
  initialNodes?: any[]
  initialEdges?: any[]
  onChange?: (nodes: any[], edges: any[]) => void
  isTemplateMode?: boolean
  onSaveTemplate?: (nodes: any[], edges: any[]) => void
  onLoadTemplate?: () => void
  showSaveAsTemplate?: boolean
}

// Software database with logos and categories
const SOFTWARE_DATABASE = {
  // CRM & Sales Tools
  "HubSpot": { name: "HubSpot", logo: "🟠", category: "CRM & Sales" },
  "Salesforce": { name: "Salesforce", logo: "🔵", category: "CRM & Sales" },
  "GoHighLevel": { name: "GoHighLevel", logo: "🟢", category: "CRM & Sales" },
  "Pipedrive": { name: "Pipedrive", logo: "🔴", category: "CRM & Sales" },
  "Zoho CRM": { name: "Zoho CRM", logo: "🟣", category: "CRM & Sales" },
  "Copper": { name: "Copper", logo: "🟡", category: "CRM & Sales" },
  "Close.com": { name: "Close.com", logo: "🔵", category: "CRM & Sales" },
  "Keap": { name: "Keap (Infusionsoft)", logo: "🟢", category: "CRM & Sales" },
  "Nimble": { name: "Nimble", logo: "🟠", category: "CRM & Sales" },
  "ActiveCampaign": { name: "ActiveCampaign", logo: "🔵", category: "CRM & Sales" },

  // Proposals, Contracts, & E-Signature
  "Better Proposals": { name: "Better Proposals", logo: "📄", category: "Proposals & Contracts" },
  "PandaDoc": { name: "PandaDoc", logo: "🐼", category: "Proposals & Contracts" },
  "DocuSign": { name: "DocuSign", logo: "✍️", category: "Proposals & Contracts" },
  "HelloSign": { name: "HelloSign (Dropbox Sign)", logo: "📝", category: "Proposals & Contracts" },
  "Jotform Sign": { name: "Jotform Sign", logo: "📋", category: "Proposals & Contracts" },
  "Adobe Sign": { name: "Adobe Sign", logo: "🔷", category: "Proposals & Contracts" },
  "Qwilr": { name: "Qwilr", logo: "📊", category: "Proposals & Contracts" },
  "Proposify": { name: "Proposify", logo: "📋", category: "Proposals & Contracts" },
  "Concord": { name: "Concord", logo: "📄", category: "Proposals & Contracts" },
  "Zohosign": { name: "Zohosign", logo: "📝", category: "Proposals & Contracts" },

  // Invoicing, Payments & Accounting
  "Xero": { name: "Xero", logo: "💚", category: "Invoicing & Accounting" },
  "QuickBooks Online": { name: "QuickBooks Online", logo: "💙", category: "Invoicing & Accounting" },
  "QuickBooks Desktop": { name: "QuickBooks Desktop", logo: "💙", category: "Invoicing & Accounting" },
  "FreshBooks": { name: "FreshBooks", logo: "🟢", category: "Invoicing & Accounting" },
  "Stripe": { name: "Stripe", logo: "💳", category: "Invoicing & Accounting" },
  "Square": { name: "Square", logo: "⬜", category: "Invoicing & Accounting" },
  "PayPal": { name: "PayPal", logo: "🔵", category: "Invoicing & Accounting" },
  "GoCardless": { name: "GoCardless", logo: "🟠", category: "Invoicing & Accounting" },
  "Wave": { name: "Wave", logo: "🌊", category: "Invoicing & Accounting" },
  "Sage Accounting": { name: "Sage Accounting", logo: "🟢", category: "Invoicing & Accounting" },
  "Intuit": { name: "Intuit", logo: "💙", category: "Invoicing & Accounting" },

  // Scheduling & Meeting Tools
  "Calendly": { name: "Calendly", logo: "📅", category: "Scheduling & Meetings" },
  "Acuity Scheduling": { name: "Acuity Scheduling", logo: "📆", category: "Scheduling & Meetings" },
  "Google Calendar": { name: "Google Calendar", logo: "📅", category: "Scheduling & Meetings" },
  "Outlook Calendar": { name: "Outlook/Exchange Calendar", logo: "📧", category: "Scheduling & Meetings" },
  "YouCanBook.me": { name: "YouCanBook.me", logo: "📚", category: "Scheduling & Meetings" },
  "SavvyCal": { name: "SavvyCal", logo: "🧠", category: "Scheduling & Meetings" },
  "Zoom": { name: "Zoom", logo: "🎥", category: "Scheduling & Meetings" },
  "Microsoft Teams": { name: "Microsoft Teams", logo: "💬", category: "Scheduling & Meetings" },
  "Google Meet": { name: "Google Meet", logo: "🎥", category: "Scheduling & Meetings" },

  // File Sharing & Cloud Storage
  "Google Drive": { name: "Google Drive", logo: "☁️", category: "File Sharing & Storage" },
  "Dropbox": { name: "Dropbox", logo: "📦", category: "File Sharing & Storage" },
  "OneDrive": { name: "OneDrive", logo: "☁️", category: "File Sharing & Storage" },
  "Box": { name: "Box", logo: "📦", category: "File Sharing & Storage" },
  "pCloud": { name: "pCloud", logo: "☁️", category: "File Sharing & Storage" },
  "Notion": { name: "Notion (as a file hub)", logo: "📝", category: "File Sharing & Storage" },
  "Egnyte": { name: "Egnyte", logo: "📁", category: "File Sharing & Storage" },

  // Task & Project Management
  "ClickUp": { name: "ClickUp", logo: "⬆️", category: "Task & Project Management" },
  "Asana": { name: "Asana", logo: "📋", category: "Task & Project Management" },
  "Monday.com": { name: "Monday.com", logo: "📅", category: "Task & Project Management" },
  "Trello": { name: "Trello", logo: "📋", category: "Task & Project Management" },
  "Basecamp": { name: "Basecamp", logo: "🏕️", category: "Task & Project Management" },
  "Wrike": { name: "Wrike", logo: "⚡", category: "Task & Project Management" },
  "Teamwork": { name: "Teamwork", logo: "👥", category: "Task & Project Management" },
  "Smartsheet": { name: "Smartsheet", logo: "📊", category: "Task & Project Management" },
  "Airtable": { name: "Airtable", logo: "📊", category: "Task & Project Management" },

  // Automation & API Tools
  "Zapier": { name: "Zapier", logo: "⚡", category: "Automation & API" },
  "Make": { name: "Make (Integromat)", logo: "🔧", category: "Automation & API" },
  "n8n": { name: "n8n", logo: "🔄", category: "Automation & API" },
  "Pipedream": { name: "Pipedream", logo: "🌊", category: "Automation & API" },
  "Tray.io": { name: "Tray.io", logo: "📦", category: "Automation & API" },
  "Workato": { name: "Workato", logo: "🔧", category: "Automation & API" },
  "Retool": { name: "Retool", logo: "🛠️", category: "Automation & API" },

  // Design, Creative, & Feedback
  "Figma": { name: "Figma", logo: "🎨", category: "Design & Creative" },
  "Adobe XD": { name: "Adobe XD", logo: "🎨", category: "Design & Creative" },
  "Adobe Creative Cloud": { name: "Adobe Creative Cloud", logo: "🎨", category: "Design & Creative" },
  "Canva": { name: "Canva", logo: "🎨", category: "Design & Creative" },
  "Sketch": { name: "Sketch", logo: "✏️", category: "Design & Creative" },
  "InVision": { name: "InVision", logo: "👁️", category: "Design & Creative" },
  "Bubbles": { name: "Bubbles (video + comment feedback)", logo: "💬", category: "Design & Creative" },

  // Video & Media Tools
  "Loom": { name: "Loom", logo: "🎥", category: "Video & Media" },
  "Frame.io": { name: "Frame.io", logo: "🎬", category: "Video & Media" },
  "Vimeo": { name: "Vimeo", logo: "🎥", category: "Video & Media" },
  "YouTube": { name: "YouTube", logo: "📺", category: "Video & Media" },
  "Wistia": { name: "Wistia", logo: "🎥", category: "Video & Media" },
  "Descript": { name: "Descript", logo: "📝", category: "Video & Media" },
  "Vidyard": { name: "Vidyard", logo: "🎥", category: "Video & Media" },
  "Veed.io": { name: "Veed.io", logo: "🎬", category: "Video & Media" },

  // Forms, Surveys & Intake
  "Typeform": { name: "Typeform", logo: "📝", category: "Forms & Surveys" },
  "Tally": { name: "Tally", logo: "📊", category: "Forms & Surveys" },
  "Google Forms": { name: "Google Forms", logo: "📋", category: "Forms & Surveys" },
  "Formless": { name: "Formless", logo: "📝", category: "Forms & Surveys" },
  "Paperform": { name: "Paperform", logo: "📄", category: "Forms & Surveys" },
  "Jotform": { name: "Jotform", logo: "📋", category: "Forms & Surveys" },
  "Gravity Forms": { name: "Gravity Forms (WordPress)", logo: "⚖️", category: "Forms & Surveys" },
  "Cognito Forms": { name: "Cognito Forms", logo: "🧠", category: "Forms & Surveys" },
  "Wufoo": { name: "Wufoo", logo: "📝", category: "Forms & Surveys" },

  // Analytics & Reporting
  "Google Analytics": { name: "Google Analytics", logo: "📊", category: "Analytics & Reporting" },
  "Looker Studio": { name: "Looker Studio (Data Studio)", logo: "📈", category: "Analytics & Reporting" },
  "Mode Analytics": { name: "Mode Analytics", logo: "📊", category: "Analytics & Reporting" },
  "Tableau": { name: "Tableau", logo: "📊", category: "Analytics & Reporting" },
  "Klipfolio": { name: "Klipfolio", logo: "📊", category: "Analytics & Reporting" },
  "Power BI": { name: "Power BI", logo: "📊", category: "Analytics & Reporting" },
  "Metabase": { name: "Metabase", logo: "📊", category: "Analytics & Reporting" },

  // Client Portals & Documentation Tools
  "SuiteDash": { name: "SuiteDash", logo: "🏠", category: "Client Portals & Docs" },
  "Portal.io": { name: "Portal.io", logo: "🚪", category: "Client Portals & Docs" },
  "Moxo": { name: "Moxo", logo: "📱", category: "Client Portals & Docs" },
  "Clinked": { name: "Clinked", logo: "🔗", category: "Client Portals & Docs" },
  "Confluence": { name: "Confluence", logo: "📚", category: "Client Portals & Docs" },
  "HelpDocs": { name: "HelpDocs", logo: "❓", category: "Client Portals & Docs" },
  "Intercom Articles": { name: "Intercom Articles", logo: "📖", category: "Client Portals & Docs" },
}

// Helper function to get software by category
const getSoftwareByCategory = () => {
  const categories: Record<string, Array<{ key: string; name: string; logo: string }>> = {}
  Object.entries(SOFTWARE_DATABASE).forEach(([key, software]) => {
    if (!categories[software.category]) {
      categories[software.category] = []
    }
    categories[software.category].push({
      key,
      name: software.name,
      logo: software.logo
    })
  })
  return categories
}

// Move getNodeStyle to the very top of the file, before all node components and nodeTypes
function getNodeStyle(type: string, selected: boolean) {
  if (!selected) return {};
  return {
    boxShadow: '0 0 0 4px #ECB22D',
    border: '2px solid #ECB22D',
    zIndex: 10,
  };
}

// Move all node component definitions to the very top of the file, before nodeTypes and WorkflowBuilder
function TaskNode({ data, selected }: any) {
  const software = data.software ? SOFTWARE_DATABASE[data.software as keyof typeof SOFTWARE_DATABASE] : null
  return (
    <div className="flex flex-col items-center justify-center px-6 py-4 rounded-lg bg-[#FBC02D] text-white shadow border-2 border-[#F9A825]" style={getNodeStyle('task', selected)}>
      <Handle type="target" position={Position.Left} id="target-left" style={{ left: -8 }} />
      <Handle type="source" position={Position.Right} id="source-right" style={{ right: -8 }} />
      <div className="flex items-center gap-2 mb-1">
        <CheckCircle />
        {software && <span className="text-lg">{software.logo}</span>}
      </div>
      <div className="font-bold text-base" style={{ textAlign: 'center' }}>{data.label}</div>
      {software && (
        <div className="text-xs opacity-80 mt-1" style={{ textAlign: 'center' }}>
          {software.name}
        </div>
      )}
    </div>
  )
}
function ApprovalNode({ data, selected }: any) {
  const software = data.software ? SOFTWARE_DATABASE[data.software as keyof typeof SOFTWARE_DATABASE] : null
  return (
    <div style={{ width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', ...getNodeStyle('approval', selected) }}>
      <Handle type="target" position={Position.Left} id="target-left" style={{ left: -8 }} />
      <Handle type="source" position={Position.Right} id="source-right" style={{ right: -8 }} />
      <div style={{
        width: 90,
        height: 90,
        background: '#43A047',
        color: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
        border: '2px solid #388E3C',
        transform: 'rotate(45deg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        <div style={{ transform: 'rotate(-45deg)', width: '100%', textAlign: 'center' }}>
          <div className="flex items-center justify-center gap-1 mb-1">
            <FileSignature />
            {software && <span className="text-lg">{software.logo}</span>}
          </div>
          <div className="font-bold text-base">{data.label}</div>
          {software && (
            <div className="text-xs opacity-80 mt-1">
              {software.name}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
function MeetingNode({ data, selected }: any) {
  const software = data.software ? SOFTWARE_DATABASE[data.software as keyof typeof SOFTWARE_DATABASE] : null
  return (
    <div className="flex flex-col items-center justify-center px-6 py-4 rounded-xl bg-[#1976D2] text-white shadow border-2 border-[#1565C0]" style={getNodeStyle('meeting', selected)}>
      <Handle type="target" position={Position.Left} id="target-left" style={{ left: -8 }} />
      <Handle type="source" position={Position.Right} id="source-right" style={{ right: -8 }} />
      <div className="flex items-center gap-2 mb-1">
        <Calendar />
        {software && <span className="text-lg">{software.logo}</span>}
      </div>
      <div className="font-bold text-base" style={{ textAlign: 'center' }}>{data.label}</div>
      {software && (
        <div className="text-xs opacity-80 mt-1" style={{ textAlign: 'center' }}>
          {software.name}
        </div>
      )}
    </div>
  )
}
function FormNode({ data, selected }: any) {
  const software = data.software ? SOFTWARE_DATABASE[data.software as keyof typeof SOFTWARE_DATABASE] : null
  return (
    <div style={{ position: 'relative', width: 140, height: 70, background: '#8E24AA', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.10)', border: '2px solid #6D1B7B', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ...getNodeStyle('form', selected) }}>
      <Handle type="target" position={Position.Left} id="target-left" style={{ left: -8 }} />
      <Handle type="source" position={Position.Right} id="source-right" style={{ right: -8 }} />
      <div className="flex items-center gap-1 mb-1">
        <ClipboardList />
        {software && <span className="text-lg">{software.logo}</span>}
      </div>
      <div className="font-bold text-base" style={{ textAlign: 'center' }}>{data.label}</div>
      {software && (
        <div className="text-xs opacity-80 mt-1" style={{ textAlign: 'center' }}>
          {software.name}
        </div>
      )}
      <div style={{ position: 'absolute', top: 0, right: 0, width: 28, height: 28, background: '#6D1B7B', borderTopRightRadius: 12, clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }} />
    </div>
  )
}
function DocNode({ data, selected }: any) {
  const software = data.software ? SOFTWARE_DATABASE[data.software as keyof typeof SOFTWARE_DATABASE] : null
  return (
    <div className="flex flex-col items-center justify-center px-6 py-4 rounded-lg bg-[#F4511E] text-white shadow border-2 border-[#BF360C]" style={getNodeStyle('doc', selected)}>
      <Handle type="target" position={Position.Left} id="target-left" style={{ left: -8 }} />
      <Handle type="source" position={Position.Right} id="source-right" style={{ right: -8 }} />
      <div className="flex items-center gap-2 mb-1">
        <FileText />
        {software && <span className="text-lg">{software.logo}</span>}
      </div>
      <div className="font-bold text-base" style={{ textAlign: 'center' }}>{data.label}</div>
      {software && (
        <div className="text-xs opacity-80 mt-1" style={{ textAlign: 'center' }}>
          {software.name}
        </div>
      )}
    </div>
  )
}
function FileUploadNode({ data, selected }: any) {
  const software = data.software ? SOFTWARE_DATABASE[data.software as keyof typeof SOFTWARE_DATABASE] : null
  return (
    <div style={{ width: 120, height: 70, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ...getNodeStyle('file_upload', selected) }}>
      <Handle type="target" position={Position.Left} id="target-left" style={{ left: -8 }} />
      <Handle type="source" position={Position.Right} id="source-right" style={{ right: -8 }} />
      <svg width="120" height="70">
        <path d="M10 30 Q10 10 30 10 H90 Q110 10 110 30 V60 Q110 65 105 65 H15 Q10 65 10 60 Z" fill="#0288D1" stroke="#01579B" strokeWidth="3" />
      </svg>
      <div style={{ position: 'absolute', top: 18, left: 0, width: '100%', textAlign: 'center', color: 'white' }}>
        <div className="flex items-center justify-center gap-1 mb-1">
          <UploadCloud />
          {software && <span className="text-lg">{software.logo}</span>}
        </div>
        <div className="font-bold text-base">{data.label}</div>
        {software && (
          <div className="text-xs opacity-80 mt-1">
            {software.name}
          </div>
        )}
      </div>
    </div>
  )
}
function AutomationNode({ data, selected }: any) {
  const software = data.software ? SOFTWARE_DATABASE[data.software as keyof typeof SOFTWARE_DATABASE] : null
  return (
    <div style={{ width: 180, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', ...getNodeStyle('automation', selected) }}>
      <Handle type="target" position={Position.Left} id="target-left" style={{ left: -8 }} />
      <Handle type="source" position={Position.Right} id="source-right" style={{ right: -8 }} />
      <svg width="160" height="90" viewBox="0 0 160 90">
        <polygon points="40,10 120,10 150,45 120,80 40,80 10,45" fill="#00B8D4" stroke="#00838F" strokeWidth="5" />
      </svg>
      <div style={{ position: 'absolute', top: 28, left: 0, width: '100%', textAlign: 'center', color: 'white', pointerEvents: 'none' }}>
        <div className="flex items-center justify-center gap-1 mb-1">
          <Zap />
          {software && <span className="text-lg">{software.logo}</span>}
        </div>
        <div className="font-bold text-base whitespace-pre-line" style={{ lineHeight: 1.1 }}>{data.label}</div>
        {software && (
          <div className="text-xs opacity-80 mt-1">
            {software.name}
          </div>
        )}
      </div>
    </div>
  )
}
function ChecklistNode({ data, selected }: any) {
  const software = data.software ? SOFTWARE_DATABASE[data.software as keyof typeof SOFTWARE_DATABASE] : null
  return (
    <div className="flex flex-col items-center justify-center px-6 py-4 rounded-lg bg-[#43A047] text-white shadow border-2 border-[#2E7D32]" style={getNodeStyle('checklist', selected)}>
      <Handle type="target" position={Position.Left} id="target-left" style={{ left: -8 }} />
      <Handle type="source" position={Position.Right} id="source-right" style={{ right: -8 }} />
      <div className="flex items-center gap-2 mb-1">
        <ListChecks />
        {software && <span className="text-lg">{software.logo}</span>}
      </div>
      <div className="font-bold text-base" style={{ textAlign: 'center' }}>{data.label}</div>
      {software && (
        <div className="text-xs opacity-80 mt-1" style={{ textAlign: 'center' }}>
          {software.name}
        </div>
      )}
    </div>
  )
}
function DueDateNode({ data, selected }: any) {
  const software = data.software ? SOFTWARE_DATABASE[data.software as keyof typeof SOFTWARE_DATABASE] : null
  return (
    <div style={{ width: 90, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', ...getNodeStyle('due_date', selected) }}>
      <Handle type="target" position={Position.Left} id="target-left" style={{ left: -8 }} />
      <Handle type="source" position={Position.Right} id="source-right" style={{ right: -8 }} />
      <svg width="90" height="90">
        <circle cx="45" cy="45" r="40" fill="#F9A825" stroke="#FBC02D" strokeWidth="4" />
      </svg>
      <div style={{ position: 'absolute', top: 22, left: 0, width: '100%', textAlign: 'center', color: 'white' }}>
        <div className="flex items-center justify-center gap-1 mb-1">
          <Bell />
          {software && <span className="text-lg">{software.logo}</span>}
        </div>
        <div className="font-bold text-base">{data.label}</div>
        {software && (
          <div className="text-xs opacity-80 mt-1">
            {software.name}
          </div>
        )}
      </div>
    </div>
  )
}
function ClientActionNode({ data, selected }: any) {
  const software = data.software ? SOFTWARE_DATABASE[data.software as keyof typeof SOFTWARE_DATABASE] : null
  return (
    <div style={{ width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', ...getNodeStyle('client_action', selected) }}>
      <Handle type="target" position={Position.Left} id="target-left" style={{ left: -8 }} />
      <Handle type="source" position={Position.Right} id="source-right" style={{ right: -8 }} />
      <div style={{
        width: 90,
        height: 90,
        background: '#D84315',
        color: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
        border: '2px solid #BF360C',
        transform: 'rotate(45deg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        <div style={{ transform: 'rotate(-45deg)', width: '100%', textAlign: 'center' }}>
          <div className="flex items-center justify-center gap-1 mb-1">
            <UserCheck />
            {software && <span className="text-lg">{software.logo}</span>}
          </div>
          <div className="font-bold text-base">{data.label}</div>
          {software && (
            <div className="text-xs opacity-80 mt-1">{software.name}</div>
          )}
        </div>
      </div>
    </div>
  )
}
function DecisionNode({ data, selected }: any) {
  const software = data.software ? SOFTWARE_DATABASE[data.software as keyof typeof SOFTWARE_DATABASE] : null
  return (
    <div style={{ width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', ...getNodeStyle('decision', selected) }}>
      <Handle type="target" position={Position.Left} id="target-left" style={{ left: -8 }} />
      <Handle type="source" position={Position.Right} id="source-right" style={{ right: -8 }} />
      <div style={{
        width: 90,
        height: 90,
        background: '#6D4C41',
        color: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
        border: '2px solid #3E2723',
        transform: 'rotate(45deg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        <div style={{ transform: 'rotate(-45deg)', width: '100%', textAlign: 'center' }}>
          <div className="flex items-center justify-center gap-1 mb-1">
            <HelpCircle />
            {software && <span className="text-lg">{software.logo}</span>}
          </div>
          <div className="font-bold text-base">{data.label}</div>
          {software && (
            <div className="text-xs opacity-80 mt-1">{software.name}</div>
          )}
        </div>
      </div>
    </div>
  )
}
function MilestoneNode({ data, selected }: any) {
  const software = data.software ? SOFTWARE_DATABASE[data.software as keyof typeof SOFTWARE_DATABASE] : null
  return (
    <div style={{ width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', ...getNodeStyle('milestone', selected) }}>
      <Handle type="target" position={Position.Left} id="target-left" style={{ left: -8 }} />
      <Handle type="source" position={Position.Right} id="source-right" style={{ right: -8 }} />
      <div style={{
        width: 90,
        height: 90,
        background: '#1976D2',
        color: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
        border: '2px solid #1565C0',
        transform: 'rotate(45deg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        <div style={{ transform: 'rotate(-45deg)', width: '100%', textAlign: 'center' }}>
          <div className="flex items-center justify-center gap-1 mb-1">
            <Flag />
            {software && <span className="text-lg">{software.logo}</span>}
          </div>
          <div className="font-bold text-base">{data.label}</div>
          {software && (
            <div className="text-xs opacity-80 mt-1">{software.name}</div>
          )}
        </div>
      </div>
    </div>
  )
}

// Move nodeTypes definition outside the component to avoid recreating it on every render
const nodeTypes = {
  task: TaskNode,
  approval: ApprovalNode,
  meeting: MeetingNode,
  form: FormNode,
  doc: DocNode,
  file_upload: FileUploadNode,
  automation: AutomationNode,
  checklist: ChecklistNode,
  due_date: DueDateNode,
  client_action: ClientActionNode,
  decision: DecisionNode,
  milestone: MilestoneNode,
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

const typeColors: Record<string, string> = {
  task: "#FBC02D",      // yellow
  approval: "#43A047",  // green
  meeting: "#1976D2",   // blue
  form: "#8E24AA",      // purple
  doc: "#F4511E",       // orange
  default: "#BDBDBD",   // gray
}

// Add stable constants for ReactFlow props
const DEFAULT_VIEWPORT = { x: 0, y: 0, zoom: 0.5 };
const SNAP_GRID: [number, number] = [20, 20];

export function WorkflowBuilder({ clientId, initialNodes, initialEdges, onChange, isTemplateMode, onSaveTemplate, onLoadTemplate, showSaveAsTemplate = true }: WorkflowBuilderProps) {
  const [nodes, setNodes, onNodesChangeRaw] = useNodesState(initialNodes || [])
  const [edges, setEdges, onEdgesChangeRaw] = useEdgesState(initialEdges || [])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [editingNode, setEditingNode] = useState<Node | null>(null)
  const [editData, setEditData] = useState<any>(null)
  const [userInitiatedEdit, setUserInitiatedEdit] = useState(false)
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([])
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<string[]>([])
  const [clipboard, setClipboard] = useState<{ nodes: Node[]; edges: Edge[] } | null>(null)
  const [templateModal, setTemplateModal] = useState<null | 'save' | 'load'>(null)
  const [templateName, setTemplateName] = useState("")
  const [templates, setTemplates] = useState<{ name: string; nodes: Node[]; edges: Edge[] }[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const containerRef = useRef<HTMLDivElement>(null)
  const [workflowKey, setWorkflowKey] = useState(0)

  // When initialNodes or initialEdges change, update workflowKey and set state
  useEffect(() => {
    setNodes(initialNodes || [])
    setEdges(initialEdges || [])
    setWorkflowKey(Date.now())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialNodes, initialEdges])

  // Track selected nodes
  useEffect(() => {
    setSelectedNodeIds(nodes.filter(n => n.selected).map(n => n.id))
  }, [nodes])

  // Track selected edges
  useEffect(() => {
    setSelectedEdgeIds(edges.filter(e => e.selected).map(e => e.id))
  }, [edges])

  // Keyboard shortcut for delete (nodes & edges)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace')) {
        if (selectedNodeIds.length > 0) {
          setNodes(nds => nds.filter(n => !selectedNodeIds.includes(n.id)))
          setEdges(eds => eds.filter(e => !selectedNodeIds.includes(e.source) && !selectedNodeIds.includes(e.target)))
        }
        if (selectedEdgeIds.length > 0) {
          setEdges(eds => eds.filter(e => !selectedEdgeIds.includes(e.id)))
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNodeIds, selectedEdgeIds, setNodes, setEdges])

  // Load templates from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("workflowTemplates")
    if (stored) {
      setTemplates(JSON.parse(stored))
    }
  }, [])

  // Save templates to localStorage when changed
  useEffect(() => {
    localStorage.setItem("workflowTemplates", JSON.stringify(templates))
  }, [templates])

  // Keyboard shortcuts for copy, paste, duplicate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
        // Copy selected nodes/edges
        const selectedNodes = nodes.filter(n => n.selected)
        const selectedNodeIds = selectedNodes.map(n => n.id)
        const selectedEdges = edges.filter(e => selectedNodeIds.includes(e.source) && selectedNodeIds.includes(e.target))
        setClipboard({ nodes: selectedNodes, edges: selectedEdges })
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
        // Paste nodes/edges from clipboard
        if (clipboard && clipboard.nodes.length > 0) {
          // Map old IDs to new IDs
          const idMap: Record<string, string> = {}
          const newNodes = clipboard.nodes.map((n) => {
            const newId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            idMap[n.id] = newId
            return {
              ...n,
              id: newId,
              position: { x: n.position.x + 40, y: n.position.y + 40 },
              selected: false,
            }
          })
          const newEdges = clipboard.edges.map((e) => ({
            ...e,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            source: idMap[e.source] || e.source,
            target: idMap[e.target] || e.target,
            selected: false,
          }))
          setNodes(nds => [...nds, ...newNodes])
          setEdges(eds => [...eds, ...newEdges])
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        // Duplicate selected nodes/edges
        const selectedNodes = nodes.filter(n => n.selected)
        const selectedNodeIds = selectedNodes.map(n => n.id)
        const selectedEdges = edges.filter(e => selectedNodeIds.includes(e.source) && selectedNodeIds.includes(e.target))
        if (selectedNodes.length > 0) {
          // Map old IDs to new IDs
          const idMap: Record<string, string> = {}
          const newNodes = selectedNodes.map((n) => {
            const newId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            idMap[n.id] = newId
            return {
              ...n,
              id: newId,
              position: { x: n.position.x + 40, y: n.position.y + 40 },
              selected: false,
            }
          })
          const newEdges = selectedEdges.map((e) => ({
            ...e,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            source: idMap[e.source] || e.source,
            target: idMap[e.target] || e.target,
            selected: false,
          }))
          setNodes(nds => [...nds, ...newNodes])
          setEdges(eds => [...eds, ...newEdges])
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nodes, edges, clipboard])

  // In template mode, call onChange when nodes/edges change
  useEffect(() => {
    if (isTemplateMode && onChange) {
      onChange(nodes, edges)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges])

  // Only fetch workflow from Supabase if not in template mode
  useEffect(() => {
    if (isTemplateMode) return
    async function fetchWorkflow() {
      setLoading(true)
      setMessage(null)
      const { data, error } = await supabase
        .from("clients")
        .select("workflow")
        .eq("id", clientId)
        .single()
      if (error) {
        setMessage("Failed to load workflow.")
        setLoading(false)
        return
      }
      let workflow = data?.workflow
      // Defensive: handle empty or corrupt data
      if (!workflow || typeof workflow !== 'object' || !Array.isArray(workflow.nodes) || !Array.isArray(workflow.edges)) {
        workflow = { nodes: [], edges: [] }
      }
      // Debug logging
      console.log("Loaded workflow:", workflow)
      // Defensive: ensure all nodes have a valid type
      setNodes((workflow.nodes || []).map((n: any) => ({
        ...n,
        type: n.data?.type || 'task',
        data: {
          ...n.data,
          type: n.data?.type || 'task',
        },
      })))
      setEdges(workflow.edges || [])
      setEditingNode(null)
      setEditData(null)
      setUserInitiatedEdit(false)
      setLoading(false)
      console.log("After loading workflow, editingNode:", editingNode)
    }
    fetchWorkflow()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, isTemplateMode])

  // Set loading to false immediately in template mode so buttons are enabled
  useEffect(() => {
    if (isTemplateMode) setLoading(false)
  }, [isTemplateMode])

  // Memoize handler functions for ReactFlow
  const onNodesChange = useCallback(onNodesChangeRaw, [])
  const onEdgesChange = useCallback(onEdgesChangeRaw, [])
  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  // Add node button (adds a new node at a random position)
  const addNode = () => {
    // Generate a unique, stable ID for each new node
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    setNodes((nds) => [
      ...nds,
      {
        id,
        type: "default",
        position: { x: Math.random() * 400 + 50, y: Math.random() * 200 + 50 },
        data: {
          label: `New Step`,
          type: "task",
          description: "",
          link: "",
        },
      },
    ])
  }

  // Save workflow to backend
  const saveWorkflow = async () => {
    setSaving(true)
    setMessage(null)
    const { error } = await supabase
      .from("clients")
      .update({ workflow: { nodes, edges } })
      .eq("id", clientId)
    if (error) {
      setMessage("Failed to save workflow.")
    } else {
      setMessage("Workflow saved!")
    }
    setSaving(false)
  }

  // Node click handler
  const onNodeDoubleClick = (_event: any, node: Node) => {
    setEditingNode(node)
    setEditData({ ...node.data })
    setUserInitiatedEdit(true)
  }

  // Save node edits
  const saveNodeEdit = () => {
    if (!editingNode) return
    const label = editData?.label && editData.label.trim() !== "" ? editData.label : "Untitled Step"
    setNodes((nds) =>
      nds.map((n) =>
        n.id === editingNode.id
          ? { ...n, data: { ...editData, label } }
          : n
      )
    )
    setEditingNode(null)
    setEditData(null)
  }

  // Color code nodes by type (for default fallback)
  const coloredNodes = nodes.map((node) => ({
    ...node,
    type: node.data?.type || 'task',
    style: node.data?.type ? {} : {
      ...node.style,
      background: typeColors[node.data?.type] || typeColors.default,
      color: "#fff",
      border: "2px solid #222",
      fontWeight: 600,
    },
  }))

  // Template save
  const saveAsTemplate = () => {
    if (!templateName.trim()) return
    setTemplates(ts => [...ts, { name: templateName.trim(), nodes, edges }])
    setTemplateModal(null)
    setTemplateName("")
  }
  // Template load
  const loadTemplate = () => {
    const t = templates.find(t => t.name === selectedTemplate)
    if (t) {
      // Map old IDs to new IDs
      const idMap: Record<string, string> = {}
      const newNodes = t.nodes.map((n) => {
        const newId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        idMap[n.id] = newId
        return {
          ...n,
          id: newId,
          position: { x: n.position.x + 60, y: n.position.y + 60 },
          selected: false,
        }
      })
      const newEdges = t.edges.map((e) => ({
        ...e,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        source: idMap[e.source] || e.source,
        target: idMap[e.target] || e.target,
        selected: false,
      }))
      setNodes(nds => [...nds, ...newNodes])
      setEdges(eds => [...eds, ...newEdges])
      setTemplateModal(null)
      setSelectedTemplate("")
    }
  }

  return (
    <section
      className={isTemplateMode ? undefined : "py-16 px-4 bg-transparent"}
      style={isTemplateMode ? { width: '100%', background: 'transparent', padding: 0, margin: 0 } : undefined}
    >
      <div
        className={isTemplateMode ? undefined : "container mx-auto flex flex-col items-center"}
        style={isTemplateMode ? { width: '100%', padding: 0, margin: 0, display: 'block' } : undefined}
      >
        <div
          className={isTemplateMode ? undefined : "w-full max-w-7xl"}
          style={isTemplateMode ? { width: '100%', maxWidth: '1200px', margin: '40px auto 0 auto' } : undefined}
        >
          <div
            className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-visible"
            style={isTemplateMode ? { width: '100%', display: 'block', padding: 0 } : undefined}
          >
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-[#ECB22D]/30 to-[#FFFBEA] rounded-t-2xl">
              <h2 className="text-2xl font-bold text-[#010124]">Workflow Builder</h2>
              <div className="flex gap-2">
                <button
                  onClick={addNode}
                  className="bg-[#ECB22D] hover:bg-[#d4a029] text-[#010124] font-semibold px-5 py-2 rounded shadow border border-[#ECB22D] transition"
                  disabled={loading || saving}
                >
                  + Add Step
                </button>
                <button
                  onClick={saveWorkflow}
                  className="bg-[#010124] hover:bg-[#22223b] text-[#ECB22D] font-semibold px-5 py-2 rounded shadow border border-[#010124] transition"
                  disabled={loading || saving}
                >
                  {saving ? "Saving..." : "Save Workflow"}
                </button>
                <button
                  onClick={() => {
                    if (isTemplateMode && onSaveTemplate) {
                      onSaveTemplate(nodes, edges)
                    } else {
                      setTemplateModal('save')
                    }
                  }}
                  className="bg-[#ECB22D] hover:bg-[#d4a029] text-[#010124] font-semibold px-5 py-2 rounded shadow border border-[#ECB22D] transition"
                  style={{ display: showSaveAsTemplate ? undefined : 'none' }}
                >
                  Save as Template
                </button>
                {(onLoadTemplate) && (
                  <button
                    onClick={() => {
                      if (isTemplateMode && onLoadTemplate) {
                        onLoadTemplate()
                      } else if (onLoadTemplate) {
                        onLoadTemplate()
                      } else {
                        setTemplateModal('load')
                      }
                    }}
                    className="bg-[#010124] hover:bg-[#22223b] text-[#ECB22D] font-semibold px-5 py-2 rounded shadow border border-[#010124] transition"
                  >
                    Load Template
                  </button>
                )}
              </div>
            </div>
            <div className={isTemplateMode ? undefined : "px-8 pt-6 pb-8"} style={isTemplateMode ? { padding: 24 } : undefined}>
              <p className="text-gray-600 text-lg mb-4 text-center">
                Collaboratively design your onboarding and service workflows here.
              </p>
              {/* Instructions Box */}
              <div className="mb-2 max-w-3xl text-xs text-gray-500 flex flex-wrap gap-x-4 gap-y-1 items-center justify-start">
                <span className="font-semibold text-gray-600 mr-2">Shortcuts:</span>
                <span><b>Pan:</b> <kbd className="px-1 py-0.5 bg-white border rounded">Space</kbd> + drag</span>
                <span><b>Select:</b> Click, <kbd className="px-1 py-0.5 bg-white border rounded">Ctrl</kbd>/<kbd className="px-1 py-0.5 bg-white border rounded">Cmd</kbd>/<kbd className="px-1 py-0.5 bg-white border rounded">Shift</kbd> + click, or drag box</span>
                <span><b>Drag:</b> Drag node(s)</span>
                <span><b>Edit:</b> Double-click node</span>
                <span><b>Connect:</b> Drag from connector</span>
                <span><b>Copy:</b> <kbd className="px-1 py-0.5 bg-white border rounded">Ctrl</kbd>/<kbd className="px-1 py-0.5 bg-white border rounded">Cmd</kbd> + <kbd className="px-1 py-0.5 bg-white border rounded">C</kbd></span>
                <span><b>Paste:</b> <kbd className="px-1 py-0.5 bg-white border rounded">Ctrl</kbd>/<kbd className="px-1 py-0.5 bg-white border rounded">Cmd</kbd> + <kbd className="px-1 py-0.5 bg-white border rounded">V</kbd></span>
                <span><b>Duplicate:</b> <kbd className="px-1 py-0.5 bg-white border rounded">Ctrl</kbd>/<kbd className="px-1 py-0.5 bg-white border rounded">Cmd</kbd> + <kbd className="px-1 py-0.5 bg-white border rounded">D</kbd></span>
                <span><b>Delete:</b> Select, then <kbd className="px-1 py-0.5 bg-white border rounded">Delete</kbd>/<kbd className="px-1 py-0.5 bg-white border rounded">Backspace</kbd></span>
                <span><b>Zoom/Pan:</b> Use controls</span>
              </div>
              {message && <div className="mb-4 text-center text-lg font-medium text-green-700">{message}</div>}
              <div
                style={isTemplateMode
                  ? { width: '100%', height: '600px', background: "#f9fafb", borderRadius: 12, pointerEvents: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }
                  : { height: 500, width: '100%', maxWidth: 1200, margin: '0 auto', background: "#f9fafb", borderRadius: 12, pointerEvents: 'auto' }}
                className="overflow-hidden"
              >
                <ReactFlow
                  key={workflowKey}
                  nodes={coloredNodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  nodeTypes={nodeTypes}
                  fitView
                  onNodeDoubleClick={onNodeDoubleClick}
                  defaultViewport={DEFAULT_VIEWPORT}
                  selectNodesOnDrag={true}
                  panOnDrag={false}
                  connectionMode={ConnectionMode.Loose}
                  snapToGrid={true}
                  snapGrid={SNAP_GRID}
                >
                  <MiniMap />
                  <Controls />
                  <Background gap={16} size={1} />
                </ReactFlow>
              </div>
              {loading && <div className="mt-4 text-gray-500">Loading workflow...</div>}
            </div>
          </div>
        </div>
        {/* Node Edit Modal */}
        {editingNode && typeof editingNode.id === 'string' && editingNode.id.length > 0 && userInitiatedEdit && (
          <Dialog open={true} onOpenChange={(open) => { if (!open) { setEditingNode(null); setUserInitiatedEdit(false); } }}>
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">Edit Step</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Label/Title</label>
                    <Input
                      value={editData?.label || ""}
                      onChange={e => setEditData((d: any) => ({ ...d, label: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={editData?.type || "task"}
                      onChange={e => setEditData((d: any) => ({ ...d, type: e.target.value }))}
                    >
                      <option value="task">Task</option>
                      <option value="approval">Approval Required</option>
                      <option value="meeting">Meeting/Call</option>
                      <option value="form">Client Form</option>
                      <option value="doc">Document</option>
                      <option value="file_upload">Upload/Deliverable</option>
                      <option value="automation">Automation / Integration</option>
                      <option value="checklist">Checklist</option>
                      <option value="due_date">Due Date / Reminder</option>
                      <option value="client_action">Client To-Do</option>
                      <option value="decision">Decision Point</option>
                      <option value="milestone">Milestone</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Software/Tool (optional)</label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={editData?.software || ""}
                      onChange={e => setEditData((d: any) => ({ ...d, software: e.target.value }))}
                    >
                      <option value="">None</option>
                      {Object.entries(getSoftwareByCategory()).map(([category, softwares]) => (
                        <optgroup key={category} label={category}>
                          {softwares.map(software => (
                            <option key={software.key} value={software.key}>
                              {software.logo} {software.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description/Notes</label>
                    <Textarea
                      value={editData?.description || ""}
                      onChange={e => setEditData((d: any) => ({ ...d, description: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Link</label>
                    <Input
                      value={editData?.link || ""}
                      onChange={e => setEditData((d: any) => ({ ...d, link: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => { setEditingNode(null); setUserInitiatedEdit(false); }}>Cancel</Button>
                  <Button onClick={saveNodeEdit}>Save</Button>
                </div>
              </div>
            </div>
          </Dialog>
        )}
        {/* Template Modals */}
        {templateModal === 'save' && (
          <Dialog open={true} onOpenChange={open => { if (!open) setTemplateModal(null) }}>
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">Save as Template</h3>
                <Input
                  placeholder="Template Name"
                  value={templateName}
                  onChange={e => setTemplateName(e.target.value)}
                  className="mb-4"
                />
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setTemplateModal(null)}>Cancel</Button>
                  <Button onClick={saveAsTemplate} disabled={!templateName.trim()}>Save</Button>
                </div>
              </div>
            </div>
          </Dialog>
        )}
        {templateModal === 'load' && (
          <Dialog open={true} onOpenChange={open => { if (!open) setTemplateModal(null) }}>
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">Load Template</h3>
                <select
                  className="w-full border rounded px-3 py-2 mb-4"
                  value={selectedTemplate}
                  onChange={e => setSelectedTemplate(e.target.value)}
                >
                  <option value="">Select a template...</option>
                  {templates.map(t => (
                    <option key={t.name} value={t.name}>{t.name}</option>
                  ))}
                </select>
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setTemplateModal(null)}>Cancel</Button>
                  <Button onClick={loadTemplate} disabled={!selectedTemplate}>Load</Button>
                </div>
              </div>
            </div>
          </Dialog>
        )}
      </div>
    </section>
  )
} 