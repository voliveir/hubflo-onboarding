import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Zap, FileText, Settings, Play, ExternalLink, CheckCircle } from "lucide-react"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-[#010124] border-b border-[#ECB22D] sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Image src="/hubflo-logo.png" alt="Hubflo Logo" width={32} height={32} className="object-contain" />
              <span className="text-xl font-bold text-white">Hubflo Onboarding Platform</span>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Navigation Bar */}
      <nav className="sticky top-[64px] z-40 bg-white/90 border-b border-[#ECB22D] shadow-sm">
        <div className="container mx-auto px-4 py-2 flex flex-wrap gap-2 justify-center">
          <a href="#welcome" className="text-[#010124] hover:text-[#ECB22D] font-medium px-3 py-1 rounded transition-colors">Welcome</a>
          <a href="#packages" className="text-[#010124] hover:text-[#ECB22D] font-medium px-3 py-1 rounded transition-colors">Packages</a>
          <a href="#launch-process" className="text-[#010124] hover:text-[#ECB22D] font-medium px-3 py-1 rounded transition-colors">Launch Process</a>
          <a href="#integrations" className="text-[#010124] hover:text-[#ECB22D] font-medium px-3 py-1 rounded transition-colors">Integrations</a>
          <a href="#support" className="text-[#010124] hover:text-[#ECB22D] font-medium px-3 py-1 rounded transition-colors">Support</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="welcome" className="py-20 px-4 bg-[#010124] text-white scroll-mt-32">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Hubflo Onboarding Platform</h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Streamlined client onboarding with personalized experiences for every success package.
          </p>
        </div>
      </section>

      {/* Enhanced Client Portal Section */}
      <section id="platform" className="py-16 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50">
              <div className="relative">
                {/* Decorative background pattern */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#ECB22D]/10 to-[#010124]/5"></div>

                <CardHeader className="relative bg-gradient-to-r from-[#ECB22D] to-[#f4c542] text-[#010124] py-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-[#010124] rounded-full flex items-center justify-center shadow-lg">
                      <Users className="h-8 w-8 text-[#ECB22D]" />
                    </div>
                  </div>
                  <CardTitle className="text-center text-3xl font-bold mb-2">Welcome to Hubflo Onboarding!    </CardTitle>
                  <CardDescription className="text-center text-[#010124]/80 text-lg font-medium">
                    Your personalized onboarding experience starts here    
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative p-8">
                  <div className="text-center space-y-6">
                    <div className="max-w-2xl mx-auto">
                      <p className="text-gray-700 text-lg leading-relaxed mb-6">
                        You've made a great choice—now let's get your team up and running smoothly with Hubflo. This portal is your step-by-step guide to success, tailored to your specific plan and goals.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mt-8">
                      <div className="text-center p-4">
                        <div className="w-12 h-12 bg-[#ECB22D]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <CheckCircle className="h-6 w-6 text-[#ECB22D]" />
                        </div>
                        <h4 className="font-semibold text-[#010124] mb-2">Personalized Experience</h4>
                        <p className="text-sm text-gray-600">Custom guidance based on your Hubflo package and business needs</p>
                      </div>

                      <div className="text-center p-4">
                        <div className="w-12 h-12 bg-[#ECB22D]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Zap className="h-6 w-6 text-[#ECB22D]" />
                        </div>
                        <h4 className="font-semibold text-[#010124] mb-2">Step-by-Step Guidance</h4>
                        <p className="text-sm text-gray-600">Step-by-step instructions to navigate every stage of onboarding</p>
                      </div>

                      <div className="text-center p-4">
                        <div className="w-12 h-12 bg-[#ECB22D]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Settings className="h-6 w-6 text-[#ECB22D]" />
                        </div>
                        <h4 className="font-semibold text-[#010124] mb-2">Real-time Progress</h4>
                        <p className="text-sm text-gray-600">Easily track your milestones and know exactly what's next</p>
                      </div>
                    </div>

                    <div className="bg-[#ECB22D]/10 rounded-lg p-6 mt-8">
                      <p className="text-[#010124] font-medium text-center">
                        <span className="inline-flex items-center">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ready to get started? You'll receive a unique link to your webpage before our first onboarding call.       
                        </span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced Tutorial Video Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto">
            <Card className="overflow-hidden shadow-2xl border-0 bg-white">
              <div className="relative">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#ECB22D] to-[#f4c542]"></div>

                <CardHeader className="bg-gradient-to-br from-[#010124] to-[#020135] text-white py-10 relative overflow-hidden">
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fillRule=evenodd%3E%3Cg fill=%23ECB22D fillOpacity=0.1%3E%3Ccircle cx=30 cy=30 r=2/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
                  </div>

                  <div className="relative text-center">
                    <div className="flex items-center justify-center mb-6">
                      <div className="w-20 h-20 bg-[#ECB22D] rounded-full flex items-center justify-center shadow-xl">
                        <Play className="h-10 w-10 text-[#010124] ml-1" />
                      </div>
                    </div>
                    <CardTitle className="text-4xl font-bold mb-4">Hubflo Implementation</CardTitle>
                    <CardDescription className="text-gray-300 text-xl max-w-3xl mx-auto leading-relaxed">
                      Here's what to expect, what's included, and how we'll launch your workspace together.
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="p-8">
                  <div className="space-y-8">
                    {/* Video container with enhanced styling */}
                    <div className="relative">
                      <div className="absolute -inset-4 bg-gradient-to-r from-[#ECB22D]/20 to-[#010124]/20 rounded-2xl blur-xl"></div>
                      <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl">
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

                    {/* Key highlights */}
                    <div className="grid md:grid-cols-2 gap-8 mt-12">
                      <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-[#010124] mb-4">What You'll Learn</h3>
                        <div className="space-y-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-[#ECB22D] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <CheckCircle className="h-4 w-4 text-[#010124]" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-[#010124]">Your Onboarding Roadmap </h4>
                              <p className="text-gray-600 text-sm">
                                A clear breakdown of each phase in your Hubflo implementation journey.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-[#ECB22D] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <CheckCircle className="h-4 w-4 text-[#010124]" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-[#010124]">
                                Key Integrations &amp; Automation Support
                              </h4>
                              <p className="text-gray-600 text-sm">
                                An overview of how we can connect Hubflo with your existing systems.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-[#ECB22D] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <CheckCircle className="h-4 w-4 text-[#010124]" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-[#010124]">How We'll Work Together</h4>
                              <p className="text-gray-600 text-sm">
                                Expectations for collaboration, communication, and how we'll ensure a successful launch.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-[#010124] mb-4">Next Steps</h3>
                        <div className="bg-gradient-to-br from-[#ECB22D]/10 to-[#ECB22D]/5 rounded-xl p-6 border border-[#ECB22D]/20">
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <span className="w-8 h-8 bg-[#ECB22D] text-[#010124] rounded-full flex items-center justify-center font-bold text-sm">
                                1
                              </span>
                              <span className="text-[#010124] font-medium">Watch this welcome video</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="w-8 h-8 bg-[#ECB22D] text-[#010124] rounded-full flex items-center justify-center font-bold text-sm">
                                2
                              </span>
                              <a
                                href="https://calendly.com/vanessa-hubflo/onboarding-kickoff-with-hubflo"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#010124] font-medium hover:text-[#ECB22D] underline cursor-pointer"
                              >
                                Schedule your first call
                              </a>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="w-8 h-8 bg-[#ECB22D] text-[#010124] rounded-full flex items-center justify-center font-bold text-sm">
                                3
                              </span>
                              <span className="text-[#010124] font-medium">
                                Get your onboarding portal link and get started!{" "}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Hubflo Onboarding Packages */}
      <section id="packages" className="py-16 px-4 scroll-mt-32">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#010124] mb-4">Hubflo Onboarding Packages</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose the perfect onboarding experience tailored to your business needs and goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Light Package */}
            <Card className="relative border-[#ECB22D] border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className="bg-green-100 text-green-800">🟢 Light</Badge>
                </div>
                <CardTitle className="text-[#010124]">Light Package</CardTitle>
                <CardDescription className="text-[#010124]">Perfect for small teams getting started</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />1 Zoom Call
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Video Tutorials
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Chat Support
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Standard Support
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Premium Package */}
            <Card className="relative border-[#ECB22D] border shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className="bg-blue-100 text-blue-800">🔵 Premium</Badge>
                </div>
                <CardTitle className="text-[#010124]">Premium Package</CardTitle>
                <CardDescription className="text-[#010124]">Most popular for growing businesses</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />2 Zoom Calls
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Basic Zapier Setup
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Up to 2 Forms/SmartDocs
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Priority Support
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Gold Package */}
            <Card className="relative border-[#ECB22D] border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className="bg-yellow-100 text-yellow-800">🟡 Gold</Badge>
                </div>
                <CardTitle className="text-[#010124]">Gold Package</CardTitle>
                <CardDescription className="text-[#010124]">Advanced features for scaling teams</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Up to 3 Zoom Calls
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Advanced Zapier Setup
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Up to 4 Forms/SmartDocs
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Priority Support
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Elite Package */}
            <Card className="relative border-[#ECB22D] border shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className="bg-red-100 text-red-800">🔴 Elite</Badge>
                </div>
                <CardTitle className="text-[#010124]">Elite Package</CardTitle>
                <CardDescription className="text-[#010124]">Complete white-glove service</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Unlimited Onboarding Calls
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Full Migration Assistance
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Custom Integrations
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Dedicated Manager
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Client Portal Launch Process */}
      <section id="launch-process" className="py-16 px-4 scroll-mt-32">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#010124] mb-4">Client Portal Launch Process</h2>
            <p className="text-gray-600 max-w-3xl mx-auto mb-8">
              Most of our clients are able to launch a first minimum viable version of their portal to a few customers
              within 1 to 2 weeks (3 to 4 weeks if you require a lot of customization).
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Phase 1 */}
            <Card className="relative border-[#ECB22D] border">
              <CardHeader>
                <div className="w-12 h-12 bg-[#ECB22D] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-[#010124] font-bold text-lg">1</span>
                </div>
                <CardTitle className="text-center text-[#010124]">Initial product discovery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm text-center">
                  You or someone from your team spends some time playing around with Hubflo (often during your trial).
                </p>
              </CardContent>
            </Card>

            {/* Phase 2 */}
            <Card className="relative border-[#ECB22D] border">
              <CardHeader>
                <div className="w-12 h-12 bg-[#ECB22D] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-[#010124] font-bold text-lg">2</span>
                </div>
                <CardTitle className="text-center text-[#010124]">Setup of your minimum viable portal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm text-center">
                  We start with a limited scope, usually 2-3 apps only (file sharing, forms, contracts or messaging) +
                  the basics (branding, custom domain, etc.).
                </p>
              </CardContent>
            </Card>

            {/* Phase 3 */}
            <Card className="relative border-[#ECB22D] border">
              <CardHeader>
                <div className="w-12 h-12 bg-[#ECB22D] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-[#010124] font-bold text-lg">3</span>
                </div>
                <CardTitle className="text-center text-[#010124]">Beta test on 2-3 clients for a few weeks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm text-center">
                  We launch a first version to gather feedback from your clients.
                </p>
              </CardContent>
            </Card>

            {/* Phase 4 */}
            <Card className="relative border-[#ECB22D] border">
              <CardHeader>
                <div className="w-12 h-12 bg-[#ECB22D] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-[#010124] font-bold text-lg">4</span>
                </div>
                <CardTitle className="text-center text-[#010124]">Adjust & expand</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm text-center">
                  We fine-tune your portal based on your clients' & team's feedback. We set up a few
                  automations/integrations. You invite the rest of your client base.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Zapier Integrations */}
      <section id="integrations" className="py-16 px-4 bg-white/50 scroll-mt-32">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#010124] mb-4">Hubflo Automations &amp; Integrations</h2>
            <div className="text-gray-600 max-w-2xl mx-auto">
              <p className="mb-2">
                Connect Hubflo with your favorite tools and automate your workflows seamlessly using our Hubflo's native
                integrations, Zapier, Make.com, or our API.
              </p>
              <p className="text-sm text-gray-500">
                Note: Zapier and Make.com require their own paid subscriptions, which are separate from your Hubflo
                plan.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="border-[#ECB22D] border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-[#010124]">
                  <Zap className="h-5 w-5 text-[#ECB22D]" />
                  <span>CRM Integration</span>
                </CardTitle>
                <CardDescription className="text-[#010124]">Sync contacts and deals automatically</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  Connect with Salesforce, HubSpot, Pipedrive, and more to keep your client data synchronized.
                </p>
                <Badge variant="outline" className="text-[#010124]">
                  Popular
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-[#ECB22D] border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-[#010124]">
                  <FileText className="h-5 w-5 text-[#ECB22D]" />
                  <span>Document Automation</span>
                </CardTitle>
                <CardDescription className="text-[#010124]">Streamline document workflows</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  Automatically generate contracts, proposals, and reports with Google Docs, DocuSign, and more.
                </p>
                <Badge variant="outline" className="text-[#010124]">
                  Time Saver
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-[#ECB22D] border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-[#010124]">
                  <Users className="h-5 w-5 text-[#ECB22D]" />
                  <span>Team Communication</span>
                </CardTitle>
                <CardDescription className="text-[#010124]">Keep everyone in the loop</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  Send notifications to Slack, Microsoft Teams, or Discord when important events happen.
                </p>
                <Badge variant="outline" className="text-[#010124]">
                  Essential
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-[#ECB22D] border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-[#010124]">
                  <Settings className="h-5 w-5 text-[#ECB22D]" />
                  <span>Project Management</span>
                </CardTitle>
                <CardDescription className="text-[#010124]">Sync tasks and milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  Create tasks in Asana, Trello, or Monday.com when new projects are started.
                </p>
                <Badge variant="outline" className="text-[#010124]">
                  Productivity
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-[#ECB22D] border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-[#010124]">
                  <FileText className="h-5 w-5 text-[#ECB22D]" />
                  <span>Accounting Integration</span>
                </CardTitle>
                <CardDescription className="text-[#010124]">Automate invoicing and payments</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  Connect with QuickBooks, Xero, or FreshBooks to automatically create invoices and track payments.
                </p>
                <Badge variant="outline" className="text-[#010124]">
                  Financial
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-[#ECB22D] border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-[#010124]">
                  <Zap className="h-5 w-5 text-[#ECB22D]" />
                  <span>Marketing Automation</span>
                </CardTitle>
                <CardDescription className="text-[#010124]">Nurture leads automatically</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  Add new clients to Mailchimp campaigns or trigger email sequences in ConvertKit.
                </p>
                <Badge variant="outline" className="text-[#010124]">
                  Growth
                </Badge>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Button className="bg-[#ECB22D] hover:bg-[#d4a029] text-[#010124]" asChild>
              <a href="https://zapier.com/apps/hubflo/integrations" target="_blank" rel="noopener noreferrer">
                <Zap className="mr-2 h-4 w-4" />
                Browse All Integrations
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Support & Tutorials */}
      <section id="support" className="py-16 px-4 scroll-mt-32">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#010124] mb-4">Support & Tutorials</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get the help you need to make the most of your Hubflo onboarding experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="text-center border-[#ECB22D] border">
              <CardHeader>
                <div className="w-12 h-12 bg-[#ECB22D] rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-[#010124]" />
                </div>
                <CardTitle className="text-[#010124]">Hubflo Knowledge Base</CardTitle>
                <CardDescription className="text-[#010124]">Comprehensive guides and documentation</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Access our complete knowledge base with step-by-step guides, troubleshooting tips, and best practices
                  for getting the most out of Hubflo.
                </p>
                <Button className="w-full bg-[#010124] hover:bg-[#020135] text-white" asChild>
                  <a href="https://support.hubflo.com/en/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visit Knowledge Base
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center border-[#ECB22D] border">
              <CardHeader>
                <div className="w-12 h-12 bg-[#ECB22D] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="h-6 w-6 text-[#010124]" />
                </div>
                <CardTitle className="text-[#010124]">Video Tutorials</CardTitle>
                <CardDescription className="text-[#010124]">Learn with our comprehensive video library</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Watch our detailed video tutorials covering everything from basic setup to advanced features and
                  integrations.
                </p>
                <Button
                  variant="outline"
                  className="w-full bg-transparent border-[#ECB22D] text-[#010124] hover:bg-[#ECB22D] hover:text-[#010124]"
                  asChild
                >
                  <a
                    href="https://www.tella.tv/playlist/cm5zq45t5001s0ak0746244z7/public"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Watch Tutorials
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#010124] text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Image src="/hubflo-logo.png" alt="Hubflo Logo" width={32} height={32} className="object-contain" />
            <span className="text-xl font-bold">Hubflo</span>
          </div>
          <p className="text-gray-400 text-sm">© Hubflo 2025. Streamlining onboarding experiences.</p>
        </div>
      </footer>
    </div>
  )
}
