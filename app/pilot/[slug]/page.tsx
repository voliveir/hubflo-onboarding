"use client";

import { Badge } from "@/components/ui/badge";
import { PortalHeader, PortalNavLink } from "@/components/ui/PortalHeader";
import { PortalSection } from "@/components/ui/PortalSection";
import { Button } from "@/components/ui/button";
import { CheckCircle, Users, Rocket, Settings, MessageCircle, Monitor, Zap, Smartphone, Video, Workflow, ArrowRight } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { use } from "react";

const PILOT_TASKS = [
  {
    id: "internal-users",
    title: "Add Internal Users",
    description: "Invite up to 4 internal users to your Pilot Program portal.",
    completed: false,
    icon: <Users className="h-5 w-5 text-[#ECB22D]" />,
  },
  {
    id: "full-access",
    title: "Full Feature Access",
    description: "Enjoy full access to all Hubflo features during your pilot.",
    completed: false,
    icon: <Rocket className="h-5 w-5 text-[#ECB22D]" />,
  },
  {
    id: "portal-templates",
    title: "Branded Portal Templates",
    description: "Setup of 2–3 branded portal templates tailored to your org.",
    completed: false,
    icon: <Settings className="h-5 w-5 text-[#ECB22D]" />,
  },
  {
    id: "guided-buildout",
    title: "Guided Portal Buildout",
    description: "Work with us to build out your portal using your workflows.",
    completed: false,
    icon: <Workflow className="h-5 w-5 text-[#ECB22D]" />,
  },
  {
    id: "implementation-manager",
    title: "Implementation Manager via Slack",
    description: "Get a dedicated Implementation Manager for support via Slack.",
    completed: false,
    icon: <MessageCircle className="h-5 w-5 text-[#ECB22D]" />,
  },
  {
    id: "zoom-calls",
    title: "Zoom Training/Support Calls",
    description: "Schedule up to 3 Zoom training or support calls.",
    completed: false,
    icon: <Video className="h-5 w-5 text-[#ECB22D]" />,
  },
  {
    id: "workflow-mapping",
    title: "Workflow Mapping & Automation",
    description: "Collaborate on workflow mapping and automation strategy.",
    completed: false,
    icon: <Monitor className="h-5 w-5 text-[#ECB22D]" />,
  },
  {
    id: "api-zapier-testing",
    title: "API, Zapier, and App Testing",
    description: "Access API, Zapier, and test the Hubflo app integrations.",
    completed: false,
    icon: <Zap className="h-5 w-5 text-[#ECB22D]" />,
  },
];

export default function PilotProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [tasks, setTasks] = React.useState(PILOT_TASKS);
  const completedCount = tasks.filter((t) => t.completed).length;
  const percent = Math.round((completedCount / tasks.length) * 100);
  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070720] to-[#0d0d25]">
      {/* Header */}
      <header className="bg-[#010124] border-b border-brand-gold sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Image src="/hubflo-logo.png" alt="Hubflo" width={32} height={32} className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold text-white">Hubflo</span>
            <span className="text-brand-gold">×</span>
            <span className="text-lg font-semibold text-white">Pilot Program</span>
          </div>
          <Badge variant="secondary" className="bg-yellow-200 text-yellow-900">
            1-Month Pilot
          </Badge>
        </div>
      </header>

      {/* Portal Navigation */}
      <PortalHeader>
        <PortalNavLink href="#welcome">Welcome</PortalNavLink>
        <PortalNavLink href="#progress">Progress</PortalNavLink>
        <PortalNavLink href="#features">What's Included</PortalNavLink>
        <PortalNavLink href="#next-steps">Next Steps</PortalNavLink>
        <PortalNavLink href="#checklist">Checklist</PortalNavLink>
      </PortalHeader>

      {/* Welcome/Hero Section */}
      <PortalSection id="welcome" gradient={false} className="bg-gradient-to-b from-[#010124] via-[#070720] to-[#0d0d25] text-white scroll-mt-32 mt-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
            Welcome to the <span className="text-brand-gold">Pilot Program</span>!
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto" style={{textShadow: '0 2px 8px rgba(7,7,32,0.3)'}}>
            Experience all of Hubflo for 1 month with dedicated support and a guided onboarding journey.
          </p>
          <Button
            size="lg"
            className="bg-brand-gold hover:bg-brand-gold-hover text-brand-DEFAULT text-lg px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
            asChild
          >
            <a href="#next-steps">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </PortalSection>

      {/* Progress Section */}
      <PortalSection id="progress" gradient={false} className="bg-white/10 backdrop-blur-sm scroll-mt-32">
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl border-2 border-[#ECB22D] p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-14 h-14 bg-[#ECB22D] rounded-2xl flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-[#010124]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-1">Overall Pilot Progress</div>
                <p className="text-white/80 text-base">Your progress through the Pilot Program</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-base font-medium text-white/80">Completion Status</span>
                <span className="text-base font-bold text-white">{percent}% Complete</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div
                  className="bg-[#ECB22D] h-3 rounded-full transition-all duration-300"
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
              <div className="flex items-center space-x-2 text-base text-white">
                <Rocket className="h-5 w-5 text-[#ECB22D]" />
                <span>Let&apos;s make your pilot a success!</span>
              </div>
            </div>
          </div>
        </div>
      </PortalSection>

      {/* What's Included Section */}
      <PortalSection id="features" gradient={false} className="bg-white/10 backdrop-blur-sm">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Your <span className="text-brand-gold">Pilot Program</span> Includes
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            Everything you need for a successful pilot: full feature access, dedicated support, and more.
          </p>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {PILOT_TASKS.map((task) => (
            <div key={task.id} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-6 flex items-start gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-brand-gold/10 border border-brand-gold/20">
                {task.icon}
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">{task.title}</h4>
                <p className="text-white/80 text-sm">{task.description}</p>
              </div>
            </div>
          ))}
        </div>
      </PortalSection>

      {/* Next Steps Section */}
      <PortalSection id="next-steps" gradient={false} className="bg-white/10 backdrop-blur-sm mt-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Next Steps
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            Start your pilot journey by working through the checklist below and scheduling your onboarding call.
          </p>
        </div>
        <div className="flex flex-col items-center gap-6">
          <Button size="lg" className="bg-brand-gold hover:bg-brand-gold-hover text-brand-DEFAULT text-lg px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95">
            Schedule Onboarding Call
          </Button>
        </div>
      </PortalSection>

      {/* Checklist Section */}
      <PortalSection id="checklist" gradient={false} className="bg-white/10 backdrop-blur-sm mt-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Pilot Program Checklist</h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            Track your progress by checking off each milestone as you complete it.
          </p>
        </div>
        <div className="max-w-4xl mx-auto space-y-8">
          {tasks.map((task) => (
            <div key={task.id} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-6 flex flex-col gap-2">
              <div className="flex items-start space-x-3">
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    task.completed
                      ? "bg-[#ECB22D] border-[#ECB22D] text-[#010124]"
                      : "border-gray-300 hover:border-[#ECB22D]"
                  }`}
                >
                  {task.completed && <CheckCircle className="h-3 w-3" />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-semibold ${task.completed ? "line-through text-white/60" : "text-white"}`}>{task.title}</h4>
                  </div>
                  <p className={`text-sm mb-3 ${task.completed ? "line-through text-white/40" : "text-white/80"}`}>{task.description}</p>
                </div>
                <div className="w-8 h-8 flex items-center justify-center">{task.icon}</div>
              </div>
            </div>
          ))}
        </div>
      </PortalSection>
    </div>
  );
} 