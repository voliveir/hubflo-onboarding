'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Zap, FileText, Settings, Play, ExternalLink, CheckCircle, Star, ArrowRight, Clock, Shield, Award, TrendingUp } from "lucide-react"
import Image from "next/image"
import { Header } from "@/components/ui/header"
import { Hero } from "@/components/ui/hero"
import { Section } from "@/components/ui/section"
import { CardHover } from "@/components/ui/card-hover"
import { PrimaryButton, SecondaryButton } from "@/components/ui/button-variants"
import { HorizontalTimeline } from "@/components/ui/horizontal-timeline"
import { Timeline } from "@/components/ui/timeline"

export default function HomePage() {
  console.log("HomePage rendered")
  return (
    <div className="min-h-screen bg-brand-foreground">
      <Header />
      
      <main className="pt-16">
        <Hero />

        {/* Welcome Video Section */}
        <Section id="welcome" className="bg-gradient-to-b from-brand-foreground via-brand-navy-light to-gray-50 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 gradient-portal opacity-30" />
          <div className="absolute top-20 right-20 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-48 h-48 bg-brand-gold/3 rounded-full blur-2xl" />
          
          <div className="relative z-10 max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-2 mb-6">
                <Star className="h-4 w-4 text-brand-gold" />
                <span className="text-brand-gold font-medium text-sm">Premium Onboarding Experience</span>
              </div>
              <h2 className="text-5xl lg:text-6xl font-bold text-brand-foreground mb-8" style={{textShadow: '0 2px 8px rgba(7,7,32,0.18)'}}>
                Welcome to <span className="text-brand-DEFAULT">Hubflo Onboarding</span>!
              </h2>
              <p className="text-xl text-brand-foreground max-w-4xl mx-auto leading-relaxed" style={{textShadow: '0 2px 8px rgba(7,7,32,0.10)'}}>
                Your personalized onboarding experience starts here. You've made a great choice! Now let's get your team up and running smoothly with Hubflo.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Video Container */}
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-brand-gold/20 to-brand-gold/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl transform rotate-1 group-hover:rotate-0 transition-all duration-500">
                  <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                    <iframe
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                      src="https://www.tella.tv/video/cmcggnhan001k0cl7cygc03yl/embed?b=0&title=0&a=0&loop=0&t=0&muted=0&wt=0"
                      allowFullScreen
                      allowTransparency
                    />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-10">
                <div>
                  <h3 className="text-3xl font-bold text-brand-foreground mb-8 flex items-center">
                    <Award className="h-8 w-8 text-brand-gold mr-3" />
                    What You'll Learn
                  </h3>
                  <div className="text-brand-foreground font-medium">
                    <HorizontalTimeline
                      steps={[
                        {
                          number: "①",
                          title: "Your Onboarding Roadmap",
                          description: "A clear breakdown of each phase in your Hubflo implementation journey."
                        },
                        {
                          number: "②",
                          title: "Key Integrations & Automation",
                          description: "An overview of how we can connect Hubflo with your existing systems."
                        },
                        {
                          number: "③",
                          title: "How We'll Work Together",
                          description: "Expectations for collaboration, communication, and successful launch."
                        }
                      ]}
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-brand-gold/10 to-brand-gold/5 rounded-3xl p-8 border border-brand-gold/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-2xl" />
                  <div className="relative z-10">
                    <h4 className="text-xl font-bold text-brand-foreground mb-6 flex items-center">
                      <Clock className="h-5 w-5 text-brand-gold mr-2" />
                      Next Steps
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4 p-3 bg-white/80 rounded-xl">
                        <span className="w-10 h-10 bg-brand-gold text-brand-DEFAULT rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                          1
                        </span>
                        <span className="text-brand-DEFAULT font-medium">Watch this welcome video</span>
                      </div>
                      <div className="flex items-center space-x-4 p-3 bg-white/80 rounded-xl">
                        <span className="w-10 h-10 bg-brand-gold text-brand-DEFAULT rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                          2
                        </span>
                        <span className="text-brand-DEFAULT font-medium">
                          Schedule your first call - check your welcome email for the calendar link!
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 p-3 bg-white/80 rounded-xl">
                        <span className="w-10 h-10 bg-brand-gold text-brand-DEFAULT rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                          3
                        </span>
                        <span className="text-brand-DEFAULT font-medium">
                          Get your onboarding portal link and get started!
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Packages Section */}
        <Section id="packages" className="bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gray-50 to-transparent" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-gold/3 rounded-full blur-3xl" />
          
          <div className="relative z-10 text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-2 mb-6">
              <Shield className="h-4 w-4 text-brand-gold" />
              <span className="text-brand-gold font-medium text-sm">Choose Your Path</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold text-brand-DEFAULT mb-8">
              Hubflo Onboarding Packages
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Choose the perfect onboarding experience tailored to your business needs and goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto relative z-10">
            {/* Light Package */}
            <CardHover
              title="Light Package"
              description="Perfect for small teams getting started"
              delay={0.1}
              className="relative group"
            >
              <ul className="space-y-4 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>1 Zoom Call</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Video Tutorials</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Chat Support</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Standard Support</span>
                </li>
              </ul>
            </CardHover>

            {/* Premium Package */}
            <CardHover
              title="Premium Package"
              description="Most popular for growing businesses"
              delay={0.2}
              className="relative group scale-105"
            >
              <ul className="space-y-4 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>2 Zoom Calls</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Basic Zapier Setup</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Up to 2 Forms/SmartDocs</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Priority Support</span>
                </li>
              </ul>
            </CardHover>

            {/* Gold Package */}
            <CardHover
              title="Gold Package"
              description="Advanced features for scaling teams"
              delay={0.3}
              className="relative group"
            >
              <ul className="space-y-4 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Up to 3 Zoom Calls</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Advanced Zapier Setup</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Up to 4 Forms/SmartDocs</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Priority Support</span>
                </li>
              </ul>
            </CardHover>

            {/* Elite Package */}
            <CardHover
              title="Elite Package"
              description="Complete white-glove service"
              delay={0.4}
              className="relative group"
            >
              <ul className="space-y-4 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Unlimited Onboarding Calls</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Full Migration Assistance</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Custom Integrations</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Dedicated Manager</span>
                </li>
              </ul>
            </CardHover>
          </div>
        </Section>

        {/* Launch Process Section */}
        <Section id="launch-process" className="bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent" />
          <div className="absolute top-20 right-20 w-48 h-48 bg-brand-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-32 h-32 bg-brand-gold/3 rounded-full blur-2xl" />
          
          <div className="relative z-10 text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-2 mb-6">
              <Clock className="h-4 w-4 text-brand-gold" />
              <span className="text-brand-gold font-medium text-sm">Launch Timeline</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold text-brand-DEFAULT mb-8">
              Client Portal Launch Process
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Most of our clients are able to launch a first minimum viable version of their portal to a few customers
              within <span className="font-semibold text-brand-gold">2 to 4 weeks</span> (4 to 8 weeks if you require a lot of customization).
            </p>
          </div>

          <Timeline
            items={[
              {
                step: 1,
                title: "Initial product discovery",
                description: "You or someone from your team spends some time playing around with Hubflo (often during your trial)."
              },
              {
                step: 2,
                title: "Setup of your minimum viable portal",
                description: "We start with a limited scope, usually 2-3 apps only (file sharing, forms, contracts or messaging) + the basics (branding, custom domain, etc.)."
              },
              {
                step: 3,
                title: "Beta test on 2-3 clients for a few weeks",
                description: "We launch a first version to gather feedback from your clients."
              },
              {
                step: 4,
                title: "Adjust & expand",
                description: "We fine-tune your portal based on your clients' & team's feedback. We set up a few automations/integrations. You invite the rest of your client base."
              }
            ]}
          />
        </Section>

        {/* Integrations Section */}
        <Section id="integrations" className="bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gray-50 to-transparent" />
          <div className="absolute top-40 right-40 w-56 h-56 bg-brand-gold/4 rounded-full blur-3xl" />
          
          <div className="relative z-10 text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-2 mb-6">
              <Zap className="h-4 w-4 text-brand-gold" />
              <span className="text-brand-gold font-medium text-sm">Powerful Integrations</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold text-brand-DEFAULT mb-8">
              Hubflo Automations & Integrations
            </h2>
            <div className="text-gray-600 max-w-3xl mx-auto">
              <p className="text-xl mb-4 leading-relaxed">
                Connect Hubflo with your favorite tools and automate your workflows seamlessly using our Hubflo's native
                integrations, Zapier, Make.com, or our API.
              </p>
              <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <strong>Note:</strong> Zapier and Make.com require their own paid subscriptions, which are separate from your Hubflo
                plan.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto relative z-10">
            <CardHover
              title="CRM Integration"
              description="Sync contacts and deals automatically"
              icon={<Zap className="h-8 w-8 text-brand-gold" />}
              delay={0.1}
            >
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                Connect with Salesforce, HubSpot, Pipedrive, and more to keep your client data synchronized.
              </p>
              <Badge variant="outline" className="text-brand-DEFAULT border-brand-gold/30">
                Popular
              </Badge>
            </CardHover>

            <CardHover
              title="Document Automation"
              description="Streamline document workflows"
              icon={<FileText className="h-8 w-8 text-brand-gold" />}
              delay={0.2}
            >
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                Automatically generate contracts, proposals, and reports with Google Docs, DocuSign, and more.
              </p>
              <Badge variant="outline" className="text-brand-DEFAULT border-brand-gold/30">
                Time Saver
              </Badge>
            </CardHover>

            <CardHover
              title="Team Communication"
              description="Keep everyone in the loop"
              icon={<Users className="h-8 w-8 text-brand-gold" />}
              delay={0.3}
            >
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                Send notifications to Slack, Microsoft Teams, or Discord when important events happen.
              </p>
              <Badge variant="outline" className="text-brand-DEFAULT border-brand-gold/30">
                Essential
              </Badge>
            </CardHover>

            <CardHover
              title="Project Management"
              description="Sync tasks and milestones"
              icon={<Settings className="h-8 w-8 text-brand-gold" />}
              delay={0.4}
            >
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                Create tasks in Asana, Trello, or Monday.com when new projects are started.
              </p>
              <Badge variant="outline" className="text-brand-DEFAULT border-brand-gold/30">
                Productivity
              </Badge>
            </CardHover>

            <CardHover
              title="Accounting Integration"
              description="Automate invoicing and payments"
              icon={<FileText className="h-8 w-8 text-brand-gold" />}
              delay={0.5}
            >
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                Connect with QuickBooks, Xero, or FreshBooks to automatically create invoices and track payments.
              </p>
              <Badge variant="outline" className="text-brand-DEFAULT border-brand-gold/30">
                Financial
              </Badge>
            </CardHover>

            <CardHover
              title="Marketing Automation"
              description="Nurture leads automatically"
              icon={<Zap className="h-8 w-8 text-brand-gold" />}
              delay={0.6}
            >
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                Add new clients to Mailchimp campaigns or trigger email sequences in ConvertKit.
              </p>
              <Badge variant="outline" className="text-brand-DEFAULT border-brand-gold/30">
                Growth
              </Badge>
            </CardHover>
          </div>

          <div className="text-center mt-16 relative z-10">
            <PrimaryButton asChild className="group">
              <a href="https://zapier.com/apps/hubflo/integrations" target="_blank" rel="noopener noreferrer">
                <Zap className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                Browse All Integrations
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </PrimaryButton>
          </div>
        </Section>

        {/* Support & Tutorials Section */}
        <Section id="support" className="bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent" />
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-brand-gold/4 rounded-full blur-3xl" />
          
          <div className="relative z-10 text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-2 mb-6">
              <Shield className="h-4 w-4 text-brand-gold" />
              <span className="text-brand-gold font-medium text-sm">24/7 Support</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold text-brand-DEFAULT mb-8">
              Support & Tutorials
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Get the help you need to make the most of your Hubflo onboarding experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto relative z-10">
            <CardHover
              title="Hubflo Knowledge Base"
              description="Comprehensive guides and documentation"
              icon={<FileText className="h-8 w-8 text-brand-gold" />}
              delay={0.1}
            >
              <p className="text-gray-600 mb-8 leading-relaxed">
                Access our complete knowledge base with step-by-step guides, troubleshooting tips, and best practices
                for getting the most out of Hubflo.
              </p>
              <PrimaryButton className="w-full group" asChild>
                <a href="https://support.hubflo.com/en/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                  Visit Knowledge Base
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </PrimaryButton>
            </CardHover>

            <CardHover
              title="Video Tutorials"
              description="Learn with our comprehensive video library"
              icon={<Play className="h-8 w-8 text-brand-gold" />}
              delay={0.2}
            >
              <p className="text-gray-600 mb-8 leading-relaxed">
                Watch our detailed video tutorials covering everything from basic setup to advanced features and
                integrations.
              </p>
              <SecondaryButton className="w-full group" asChild>
                <a
                  href="https://www.tella.tv/playlist/cm5zq45t5001s0ak0746244z7/public"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Play className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                  Watch Tutorials
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </SecondaryButton>
            </CardHover>
          </div>
        </Section>
      </main>

      {/* Footer */}
      <footer className="bg-brand-DEFAULT py-16 w-full">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="relative">
              <Image src="/hubflo-logo.png" alt="Hubflo Logo" width={40} height={40} className="object-contain" />
            </div>
            <span style={{color: '#000', fontWeight: 700, fontSize: '2rem', lineHeight: 1, display: 'inline-block', marginLeft: 8, marginTop: 4, marginBottom: 4, textShadow: '0 2px 8px #fff'}}>
              Hubflo
            </span>
          </div>
          <p style={{color: '#000', fontSize: '1.125rem', marginBottom: 32, fontWeight: 500, textShadow: '0 2px 8px #fff', WebkitTextStroke: '0.5px #fff'}}>
            Streamlining onboarding experiences with premium support and cutting-edge technology.
          </p>
          <div style={{color: '#000', opacity: 0.7, fontSize: '1rem', display: 'flex', justifyContent: 'center', gap: 24}}>
            <span>© Hubflo 2025</span>
            <span>•</span>
            <span><a href="https://www.hubflo.com/utility-pages/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a></span>
            <span>•</span>
            <span><a href="https://www.hubflo.com/utility-pages/terms-of-service" target="_blank" rel="noopener noreferrer">Terms of Service</a></span>
          </div>
        </div>
      </footer>
    </div>
  )
}
