"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  GraduationCap,
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  Award,
  ChevronRight,
  ChevronLeft,
  FileText,
  Download,
  ExternalLink,
  Video,
  HelpCircle,
  Sparkles,
} from "lucide-react"
import type {
  UniversitySchool,
  UniversityCourse,
  UniversityClientProgress,
  UniversityCertificate,
  UniversityLecture,
  UniversityOnboardingQuestion,
  UniversityClientOnboarding,
} from "@/lib/types"
import { PortalSection } from "@/components/ui/PortalSection"
import { formatCourseDuration } from "@/lib/utils"
import { LectureViewer } from "./LectureViewer"

interface UniversityClientProps {
  clientId: string
  clientSlug: string
  clientName: string
  schools: UniversitySchool[]
  courses: UniversityCourse[]
  clientProgress: UniversityClientProgress[]
  certificates: UniversityCertificate[]
  onboarding: UniversityClientOnboarding | null
  onboardingQuestions: UniversityOnboardingQuestion[]
}

export function UniversityClient({
  clientId,
  clientSlug,
  clientName,
  schools,
  courses,
  clientProgress,
  certificates,
  onboarding,
  onboardingQuestions,
}: UniversityClientProps) {
  const router = useRouter()
  const [selectedSchool, setSelectedSchool] = useState<UniversitySchool | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<UniversityCourse | null>(null)
  const [viewMode, setViewMode] = useState<"overview" | "school" | "course">("overview")
  const [fullCoursesData, setFullCoursesData] = useState<Map<string, UniversityCourse>>(new Map())
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [completedSchools, setCompletedSchools] = useState<UniversitySchool[]>([])
  const [onboardingResponses, setOnboardingResponses] = useState<Record<string, string>>({})
  const [onboardingSubmitting, setOnboardingSubmitting] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [redoOnboarding, setRedoOnboarding] = useState(false)

  // Create progress map
  const progressMap = new Map(
    clientProgress.map(p => [p.lecture_id || p.course_id, p])
  )

  // Fetch full course data with sections and lectures
  useEffect(() => {
    const fetchFullCourses = async () => {
      if (courses.length === 0) return
      
      setLoadingCourses(true)
      try {
        const coursePromises = courses.map(async (course) => {
          try {
            const response = await fetch(`/api/university/course/${course.id}`)
            if (response.ok) {
              const data = await response.json()
              return { id: course.id, data: data.data }
            }
          } catch (error) {
            console.error(`Error fetching course ${course.id}:`, error)
          }
          return null
        })

        const results = await Promise.all(coursePromises)
        const coursesMap = new Map<string, UniversityCourse>()
        
        results.forEach((result) => {
          if (result?.data) {
            coursesMap.set(result.id, result.data)
          }
        })

        setFullCoursesData(coursesMap)
      } catch (error) {
        console.error("Error fetching full courses:", error)
      } finally {
        setLoadingCourses(false)
      }
    }

    fetchFullCourses()
  }, [courses])

  // Check if a course is fully completed (all lectures completed)
  const isCourseFullyCompleted = useCallback((courseId: string): boolean => {
    const fullCourse = fullCoursesData.get(courseId)
    if (!fullCourse || !fullCourse.sections) return false

    // Get all lectures from all sections
    const allLectures: UniversityLecture[] = []
    fullCourse.sections.forEach((section) => {
      if (section.lectures) {
        section.lectures.forEach((lecture) => {
          allLectures.push(lecture)
        })
      }
    })

    if (allLectures.length === 0) return false

    // Check if all lectures are completed
    const allCompleted = allLectures.every((lecture) => {
      const progress = clientProgress.find((p) => p.lecture_id === lecture.id)
      return progress?.is_completed === true
    })

    return allCompleted
  }, [fullCoursesData, clientProgress])

  // Check if a school/program is fully completed (all courses completed)
  const isSchoolCompleted = useCallback((schoolId: string): boolean => {
    const schoolCourses = courses.filter(c => c.school_id === schoolId)
    if (schoolCourses.length === 0) return false

    // Check if all courses in the school are fully completed
    return schoolCourses.every((course) => isCourseFullyCompleted(course.id))
  }, [courses, isCourseFullyCompleted])

  // Calculate completed schools
  useEffect(() => {
    if (!loadingCourses && fullCoursesData.size > 0 && courses.length > 0) {
      const completed = schools.filter((school) => {
        const schoolCourses = courses.filter(c => c.school_id === school.id)
        if (schoolCourses.length === 0) return false
        return schoolCourses.every((course) => {
          const fullCourse = fullCoursesData.get(course.id)
          if (!fullCourse || !fullCourse.sections) return false

          // Get all lectures from all sections
          const allLectures: UniversityLecture[] = []
          fullCourse.sections.forEach((section) => {
            if (section.lectures) {
              section.lectures.forEach((lecture) => {
                allLectures.push(lecture)
              })
            }
          })

          if (allLectures.length === 0) return false

          // Check if all lectures are completed
          return allLectures.every((lecture) => {
            const progress = clientProgress.find((p) => p.lecture_id === lecture.id)
            return progress?.is_completed === true
          })
        })
      })
      setCompletedSchools(completed)
    } else {
      setCompletedSchools([])
    }
  }, [schools, courses, fullCoursesData, clientProgress, loadingCourses])

  // Calculate course progress
  const getCourseProgress = (courseId: string) => {
    const courseProgress = clientProgress.filter(p => p.course_id === courseId)
    if (courseProgress.length === 0) return 0
    
    const totalProgress = courseProgress.reduce((sum, p) => sum + p.progress_percentage, 0)
    return Math.round(totalProgress / courseProgress.length)
  }

  // Check if course is completed (simplified check for display)
  const isCourseCompleted = (courseId: string) => {
    return isCourseFullyCompleted(courseId)
  }

  const recommendedSchoolIds = onboarding?.recommended_school_ids ?? []
  const showOnboardingForm =
    onboardingQuestions.length > 0 && (!onboarding?.completed_at || redoOnboarding)

  const handleOnboardingSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setOnboardingSubmitting(true)
    try {
      const res = await fetch(`/api/client/${clientSlug}/university/onboarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses: onboardingResponses }),
      })
      if (!res.ok) throw new Error("Failed to save")
      setRedoOnboarding(false)
      router.refresh()
    } catch (err) {
      console.error(err)
      setOnboardingSubmitting(false)
    }
  }

  // First-time entry: Typeform-style one-question-at-a-time onboarding
  if (showOnboardingForm) {
    const flatQuestions = [...onboardingQuestions].sort(
      (a, b) => a.phase - b.phase || a.sort_order - b.sort_order
    )
    const totalSteps = flatQuestions.length
    const currentQuestion = flatQuestions[onboardingStep]
    const isLastStep = onboardingStep === totalSteps - 1
    const progressPercent = totalSteps > 0 ? ((onboardingStep + 1) / totalSteps) * 100 : 0

    const handleOptionSelect = (questionKey: string, value: string) => {
      setOnboardingResponses((prev) => ({ ...prev, [questionKey]: value }))
      if (!isLastStep) {
        setTimeout(() => setOnboardingStep((s) => s + 1), 280)
      }
    }

    return (
      <div className="min-h-screen bg-[#060520] flex flex-col scroll-mt-32 mt-24">
        {/* Progress bar */}
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-white/10">
          <div
            className="h-full bg-brand-gold transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 py-16 sm:py-24 max-w-3xl mx-auto w-full">
          {currentQuestion ? (
            <div
              key={currentQuestion.id}
              className="animate-in fade-in slide-in-from-bottom-4 duration-300"
            >
              <p className="text-brand-gold/90 text-sm font-medium tracking-wide uppercase mb-6">
                Question {onboardingStep + 1} of {totalSteps}
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white leading-tight mb-12">
                {currentQuestion.question_text}
              </h2>

              <div className="space-y-4">
                {(currentQuestion.options || []).map((opt) => {
                  const isSelected = onboardingResponses[currentQuestion.question_key] === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleOptionSelect(currentQuestion.question_key, opt.value)}
                      className={`w-full text-left px-6 py-5 rounded-2xl border-2 transition-all duration-200 text-lg font-medium flex items-center justify-between group ${
                        isSelected
                          ? "border-brand-gold bg-brand-gold/15 text-white shadow-lg shadow-brand-gold/20"
                          : "border-white/20 bg-white/5 text-white/95 hover:border-white/40 hover:bg-white/10"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <CheckCircle className="h-6 w-6 text-brand-gold flex-shrink-0" />}
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center justify-between mt-14">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOnboardingStep((s) => Math.max(0, s - 1))}
                  disabled={onboardingStep === 0}
                  className="text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-30"
                >
                  <ChevronLeft className="h-5 w-5 mr-1" />
                  Back
                </Button>
                {isLastStep ? (
                  <Button
                    type="button"
                    onClick={() => handleOnboardingSubmit()}
                    disabled={onboardingSubmitting || !onboardingResponses[currentQuestion.question_key]}
                    className="bg-brand-gold hover:bg-brand-gold-hover text-[#010124] font-semibold px-8 py-6 text-lg rounded-2xl disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {onboardingSubmitting ? "Saving…" : "See my programs"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => setOnboardingStep((s) => s + 1)}
                    className="bg-white/10 hover:bg-white/20 text-white font-medium px-8 py-6 text-lg rounded-2xl border border-white/20"
                  >
                    Next
                    <ChevronRight className="h-5 w-5 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-white/80">
              <p>No questions to show.</p>
            </div>
          )}
        </div>

        {/* Subtle branding */}
        <div className="pb-8 text-center">
          <span className="text-white/40 text-sm">Hubflo University</span>
        </div>
      </div>
    )
  }

  // If no schools or courses exist, show coming soon
  if (schools.length === 0 && courses.length === 0) {
    return (
      <PortalSection gradient={true} className="text-white scroll-mt-32 mt-40 bg-transparent relative overflow-hidden !py-24 min-h-[60vh]">
        <div className="absolute inset-0 gradient-portal opacity-30" />
        <div className="relative z-10 text-center flex flex-col justify-center min-h-[50vh]">
          <GraduationCap className="h-24 w-24 text-brand-gold mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg" style={{textShadow: '0 2px 8px rgba(236, 178, 45, 0.33)'}}>
            Hubflo University
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto" style={{textShadow: '0 2px 8px #000'}}>
            Coming Soon
          </p>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            We're building a comprehensive educational platform to help you master Hubflo. 
            Check back soon for courses, tutorials, quizzes, and certificates!
          </p>
        </div>
      </PortalSection>
    )
  }

  if (viewMode === "school" && selectedSchool) {
    return (
      <SchoolDetailView
        school={selectedSchool}
        courses={courses.filter(c => c.school_id === selectedSchool.id)}
        clientId={clientId}
        clientProgress={clientProgress}
        getCourseProgress={getCourseProgress}
        isCourseCompleted={isCourseCompleted}
        onBack={() => {
          router.refresh()
          setViewMode("overview")
          setSelectedSchool(null)
        }}
        onCourseSelect={(course) => {
          setSelectedCourse(course)
          setViewMode("course")
          // Keep selectedSchool in state for navigation back
        }}
      />
    )
  }

  if (viewMode === "course" && selectedCourse) {
    return (
      <CourseDetailView
        course={selectedCourse}
        clientId={clientId}
        clientProgress={clientProgress}
        onBack={() => {
          router.refresh()
          if (selectedSchool) {
            setViewMode("school")
          } else {
            setViewMode("overview")
            setSelectedCourse(null)
          }
        }}
      />
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section – same dark navy as header/badges (#010124) */}
      <PortalSection gradient={false} className="text-white scroll-mt-32 mt-40 relative overflow-hidden !py-24 min-h-[40vh] !bg-[#010124]">
        <div className="absolute inset-0 gradient-portal opacity-20" />
        <div className="relative z-10 text-center flex flex-col justify-center">
          <GraduationCap className="h-16 w-16 text-brand-gold mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg" style={{textShadow: '0 2px 8px rgba(236, 178, 45, 0.33)'}}>
            Hubflo University
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto" style={{textShadow: '0 2px 8px #000'}}>
            Master Hubflo with our comprehensive educational platform
          </p>
        </div>
      </PortalSection>

      {/* Pokemon-style badge holder: all programs in a row, collected = gold, uncollected = black silhouette */}
      {schools.length > 0 && (
        <PortalSection gradient={false} className="relative overflow-hidden p-0">
          <div className="w-full py-5" style={{ backgroundColor: "#010124" }}>
            <div className="max-w-6xl mx-auto px-4">
            <p className="text-white/70 text-sm font-medium text-center mb-4">Program badges</p>
            <div className="flex flex-wrap items-end justify-center gap-6 sm:gap-8">
              {schools.map((school) => {
                const isCollected = isSchoolCompleted(school.id)
                return (
                  <button
                    key={school.id}
                    type="button"
                    onClick={() => {
                      setSelectedSchool(school)
                      setViewMode("school")
                    }}
                    title={school.name}
                    className="group flex flex-col items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#010124] rounded-full"
                  >
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-2 transition-all duration-200 hover:scale-110 ${
                        isCollected
                          ? "bg-brand-gold border-brand-gold shadow-lg shadow-brand-gold/30"
                          : "bg-black/80 border-white/20 shadow-[0_0_12px_rgba(0,0,0,0.6)]"
                      }`}
                    >
                      <Award
                        className={`h-6 w-6 sm:h-7 sm:w-7 ${
                          isCollected ? "text-[#010124]" : "text-white/25"
                        }`}
                      />
                    </div>
                    <span className="text-xs font-medium text-white/90 max-w-[5rem] sm:max-w-[6rem] truncate text-center leading-tight group-hover:text-white">
                      {school.name}
                    </span>
                  </button>
                )
              })}
            </div>
            </div>
          </div>
        </PortalSection>
      )}

      {/* Certificates Section */}
      {certificates.length > 0 && (
        <PortalSection gradient={false} className="relative overflow-hidden bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-2 mb-6">
                <Award className="h-4 w-4 text-brand-gold" />
                <span className="text-brand-gold font-medium text-sm">Your Achievements</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: '#060520' }}>
                Certificates Earned
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <Card key={cert.id} className="border-brand-gold/20 hover:border-brand-gold/40 transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Award className="h-8 w-8 text-brand-gold" />
                      <Badge className="bg-brand-gold text-[#010124]">Completed</Badge>
                    </div>
                    <CardTitle className="mt-4" style={{ color: '#060520' }}>
                      {cert.course_id ? "Course Certificate" : "Certificate"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Issued on {new Date(cert.issued_at).toLocaleDateString()}
                    </p>
                    {cert.certificate_url && (
                      <Button
                        variant="outline"
                        className="w-full border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-[#010124]"
                        asChild
                      >
                        <a href={cert.certificate_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          Download Certificate
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </PortalSection>
      )}

      {/* Recommended for you – grouped by question phase (from onboarding form) */}
      {recommendedSchoolIds.length > 0 && (() => {
        const byPhaseFromQuestions = onboarding?.recommended_school_ids_by_phase
        const schoolMap = new Map(schools.map((s) => [s.id, s]))
        const phaseConfig: Record<number, { title: string; subtitle: string }> = {
          1: {
            title: "Phase 1",
            subtitle: "Set up your workspace & understand Hubflo",
          },
          2: {
            title: "Phase 2",
            subtitle: "Billing, SmartDocs & integrations",
          },
          3: {
            title: "Phase 3",
            subtitle: "Automations, Zapier & the rest",
          },
        }
        const getSchoolsForPhase = (phase: 1 | 2 | 3): UniversitySchool[] => {
          if (byPhaseFromQuestions) {
            const ids = byPhaseFromQuestions[String(phase)] ?? []
            return ids.map((id) => schoolMap.get(id)).filter(Boolean) as UniversitySchool[]
          }
          const recommendedSchools = schools.filter((s) => recommendedSchoolIds.includes(s.id))
          return recommendedSchools.filter((s) => (s.phase ?? 1) === phase)
        }
        const renderSchoolCard = (school: UniversitySchool) => {
          const schoolCourses = courses.filter((c) => c.school_id === school.id)
          const totalCourses = schoolCourses.length
          const completedCourses = schoolCourses.filter((c) => isCourseCompleted(c.id)).length
          const isCompleted = isSchoolCompleted(school.id)
          return (
            <Card
              key={school.id}
              className={`${
                isCompleted
                  ? "border-4 border-brand-gold bg-gradient-to-br from-brand-gold/10 to-transparent shadow-lg"
                  : "border-2 border-brand-gold/50 hover:border-brand-gold bg-white"
              } transition-all cursor-pointer group relative overflow-hidden`}
              onClick={() => {
                setSelectedSchool(school)
                setViewMode("school")
              }}
            >
              {isCompleted && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-brand-gold rounded-full p-2 shadow-lg">
                    <Award className="h-6 w-6 text-[#010124]" />
                  </div>
                </div>
              )}
              <CardHeader>
                {school.image_url && (
                  <div className="w-full h-40 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                    <img
                      src={school.image_url}
                      alt={school.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap className="h-5 w-5 text-brand-gold" />
                      <CardTitle style={{ color: "#060520" }}>{school.name}</CardTitle>
                    </div>
                    {school.description && (
                      <CardDescription className="text-gray-600 line-clamp-2 mt-1">
                        {school.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={(completedCourses / totalCourses) * 100} className="h-2 mb-2" />
                  <p className="text-sm text-gray-500">
                    {completedCourses} of {totalCourses} courses completed
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-brand-gold hover:bg-brand-gold-hover text-[#010124]"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedSchool(school)
                    setViewMode("school")
                  }}
                >
                  {isCompleted ? "Review" : "Continue"} <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          )
        }
        return (
          <PortalSection gradient={false} className="relative overflow-hidden bg-white">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-10 pt-4">
                <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/30 rounded-full px-6 py-2 mb-4">
                  <Sparkles className="h-4 w-4 text-brand-gold" />
                  <span className="text-brand-gold font-medium text-sm">Recommended for you</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#060520" }}>
                  Your implementation path
                </h2>
              </div>

              {([1, 2, 3] as const).map((phase) => {
                const phaseSchools = getSchoolsForPhase(phase)
                if (phaseSchools.length === 0) return null
                const config = phaseConfig[phase]
                return (
                  <div
                    key={phase}
                    className={`rounded-2xl border-2 border-brand-gold/20 bg-gray-50/80 p-6 sm:p-8 mb-8 last:mb-0 ${phase === 1 ? "" : "mt-10"}`}
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <span className="flex items-center justify-center w-12 h-12 rounded-full bg-brand-gold text-[#010124] font-bold text-xl shadow-md">
                        {phase}
                      </span>
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold" style={{ color: "#060520" }}>
                          {config.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-0.5">{config.subtitle}</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {phaseSchools.map(renderSchoolCard)}
                    </div>
                  </div>
                )
              })}

              <div className="text-center pt-4 pb-6 mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRedoOnboarding(true)}
                  className="border-brand-gold text-brand-gold hover:bg-brand-gold/10 hover:text-brand-gold"
                >
                  Update my recommended programs
                </Button>
                <p className="text-xs text-gray-500 mt-2">Redo the short questionnaire to refresh your path</p>
              </div>
            </div>
          </PortalSection>
        )
      })()}

      {/* Programs Section */}
      <PortalSection gradient={false} className="relative overflow-hidden bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-2 mb-6">
              <GraduationCap className="h-4 w-4 text-brand-gold" />
              <span className="text-brand-gold font-medium text-sm">Learning Path</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: '#060520' }}>
              {recommendedSchoolIds.length > 0 ? "All programs" : "Select a Program"}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {recommendedSchoolIds.length > 0
                ? "Explore all available programs"
                : "Choose a program to explore available courses and start your learning journey"}
            </p>
          </div>

          {/* Programs Grid */}
          {schools.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schools.map((school) => {
                const schoolCourses = courses.filter(c => c.school_id === school.id)
                const totalCourses = schoolCourses.length
                const completedCourses = schoolCourses.filter(c => isCourseCompleted(c.id)).length
                const isCompleted = isSchoolCompleted(school.id)
                
                return (
                  <Card
                    key={school.id}
                    className={`${
                      isCompleted 
                        ? 'border-4 border-brand-gold bg-gradient-to-br from-brand-gold/10 to-transparent shadow-lg' 
                        : 'border-gray-200 hover:border-brand-gold/40'
                    } transition-all cursor-pointer group relative overflow-hidden`}
                    onClick={() => {
                      setSelectedSchool(school)
                      setViewMode("school")
                    }}
                  >
                    {isCompleted && (
                      <div className="absolute top-4 right-4 z-10">
                        <div className="bg-brand-gold rounded-full p-2 shadow-lg animate-bounce">
                          <Award className="h-6 w-6 text-[#010124]" />
                        </div>
                      </div>
                    )}
                    <CardHeader>
                      {school.image_url && (
                        <div className={`w-full h-40 bg-gray-100 rounded-lg mb-4 overflow-hidden ${
                          isCompleted ? 'ring-4 ring-brand-gold' : ''
                        }`}>
                          <img
                            src={school.image_url}
                            alt={school.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      )}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <GraduationCap className={`h-5 w-5 ${isCompleted ? 'text-brand-gold' : 'text-brand-gold'}`} />
                            <CardTitle style={{ color: '#060520' }}>
                              {school.name}
                            </CardTitle>
                          </div>
                          {school.description && (
                            <CardDescription className="line-clamp-2">
                              {school.description}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {isCompleted ? (
                          <div className="flex items-center justify-center mb-2">
                            <Badge className="bg-brand-gold text-[#010124] px-4 py-1.5 text-sm font-bold">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Program Completed!
                            </Badge>
                          </div>
                        ) : null}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {totalCourses} {totalCourses === 1 ? 'Course' : 'Courses'}
                          </span>
                          {completedCourses > 0 && (
                            <span className={`font-medium ${isCompleted ? 'text-brand-gold' : 'text-brand-gold'}`}>
                              {completedCourses}/{totalCourses} Completed
                            </span>
                          )}
                        </div>
                        
                        {totalCourses > 0 && (
                          <div className="flex items-center justify-between">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-brand-gold hover:text-brand-gold-hover"
                            >
                              View Courses
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600">No programs available yet.</p>
            </div>
          )}
        </div>
      </PortalSection>

      {/* Redo onboarding – show at bottom only when no recommended section (link is in recommended section otherwise) */}
      {onboarding?.completed_at && onboardingQuestions.length > 0 && recommendedSchoolIds.length === 0 && (
        <PortalSection gradient={false} className="relative overflow-hidden bg-gray-50/80">
          <div className="max-w-6xl mx-auto py-6 text-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRedoOnboarding(true)}
              className="border-brand-gold text-brand-gold hover:bg-brand-gold/10 hover:text-brand-gold"
            >
              Update my recommended programs
            </Button>
            <p className="text-xs text-gray-500 mt-2">Redo the short questionnaire to refresh your path</p>
          </div>
        </PortalSection>
      )}
    </div>
  )
}

// School Detail View Component
function SchoolDetailView({
  school,
  courses,
  clientId,
  clientProgress,
  getCourseProgress,
  isCourseCompleted,
  onBack,
  onCourseSelect,
}: {
  school: UniversitySchool
  courses: UniversityCourse[]
  clientId: string
  clientProgress: UniversityClientProgress[]
  getCourseProgress: (courseId: string) => number
  isCourseCompleted: (courseId: string) => boolean
  onBack: () => void
  onCourseSelect: (course: UniversityCourse) => void
}) {
  return (
    <div className="min-h-screen">
      <PortalSection gradient={false} className="relative overflow-hidden bg-white">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 text-brand-gold hover:text-brand-gold-hover"
          >
            ← Back to Programs
          </Button>
          
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              {school.image_url && (
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={school.image_url}
                    alt={school.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="h-6 w-6 text-brand-gold" />
                  <h1 className="text-4xl font-bold" style={{ color: '#060520' }}>
                    {school.name}
                  </h1>
                </div>
                {school.description && (
                  <p className="text-lg text-gray-600">{school.description}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-2 mb-4">
              <BookOpen className="h-4 w-4 text-brand-gold" />
              <span className="text-brand-gold font-medium text-sm">Available Courses</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#060520' }}>
              Courses in {school.name}
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Explore all available courses in this program
            </p>
          </div>

          {/* Courses Grid */}
          {courses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const progress = getCourseProgress(course.id)
                const completed = isCourseCompleted(course.id)
                
                return (
                  <Card
                    key={course.id}
                    className="border-gray-200 hover:border-brand-gold/40 transition-all cursor-pointer group"
                    onClick={() => onCourseSelect(course)}
                  >
                    <CardHeader>
                      {course.image_url && (
                        <div className="w-full h-32 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                          <img
                            src={course.image_url}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      )}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="mb-2" style={{ color: '#060520' }}>
                            {course.title}
                          </CardTitle>
                          {course.difficulty_level && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                course.difficulty_level === 'beginner'
                                  ? 'border-green-500 text-green-700'
                                  : course.difficulty_level === 'intermediate'
                                  ? 'border-yellow-500 text-yellow-700'
                                  : 'border-red-500 text-red-700'
                              }`}
                            >
                              {course.difficulty_level}
                            </Badge>
                          )}
                        </div>
                        {completed && (
                          <CheckCircle className="h-6 w-6 text-brand-gold flex-shrink-0" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {course.description && (
                        <CardDescription className="mb-4 line-clamp-2">
                          {course.description}
                        </CardDescription>
                      )}
                      
                      <div className="space-y-3">
                        {progress > 0 && (
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-medium" style={{ color: '#060520' }}>{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-sm">
                          {course.estimated_duration_minutes && (
                            <div className="flex items-center text-gray-600">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatCourseDuration(course.estimated_duration_minutes)}
                            </div>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-brand-gold hover:text-brand-gold-hover"
                          >
                            Start Course
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600">No courses available in this program yet.</p>
            </div>
          )}
        </div>
      </PortalSection>
    </div>
  )
}

// Course Detail View Component
function CourseDetailView({
  course,
  clientId,
  clientProgress,
  onBack,
}: {
  course: UniversityCourse
  clientId: string
  clientProgress: UniversityClientProgress[]
  onBack: () => void
}) {
  const [selectedLecture, setSelectedLecture] = useState<UniversityLecture | null>(null)
  const [localProgress, setLocalProgress] = useState<UniversityClientProgress[]>(() =>
    clientProgress.filter((p) => p.course_id === course.id)
  )
  const [fullCourse, setFullCourse] = useState<UniversityCourse | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch full course data with sections and lectures
  useEffect(() => {
    const fetchFullCourse = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/university/course/${course.id}`)
        if (response.ok) {
          const data = await response.json()
          setFullCourse(data.data)
        } else {
          // Fallback to the course passed in
          setFullCourse(course)
        }
      } catch (error) {
        console.error("Error fetching full course:", error)
        // Fallback to the course passed in
        setFullCourse(course)
      } finally {
        setLoading(false)
      }
    }

    fetchFullCourse()
  }, [course.id])

  // Use fullCourse if available, otherwise fallback to course
  const courseData = fullCourse || course

  // Get all lectures from course
  const allLectures: UniversityLecture[] = []
  courseData.sections?.forEach((section) => {
    section.lectures?.forEach((lecture) => {
      allLectures.push(lecture)
    })
  })

  // Check if course is completed
  const isCourseCompleted = () => {
    if (allLectures.length === 0) return false
    const completedLectures = allLectures.filter((lecture) => {
      const progress = localProgress.find((p) => p.lecture_id === lecture.id)
      return progress?.is_completed
    })
    return completedLectures.length === allLectures.length
  }

  const handleLectureComplete = async () => {
    // Refresh progress from server so progress bar and checkmarks update immediately
    const response = await fetch(`/api/university/progress?clientId=${clientId}&courseId=${course.id}`)
    if (response.ok) {
      const json = await response.json()
      const freshProgress = Array.isArray(json.data) ? json.data : []
      setLocalProgress(freshProgress)

      // Use fresh data for completion check (state won't have updated yet)
      const allComplete =
        allLectures.length > 0 &&
        allLectures.every((lecture) => {
          const p = freshProgress.find((r: UniversityClientProgress) => r.lecture_id === lecture.id)
          return p?.is_completed === true
        })

      if (allComplete) {
        const certResponse = await fetch(`/api/university/certificate?clientId=${clientId}`)
        if (certResponse.ok) {
          const certData = await certResponse.json()
          const hasCertificate = certData.data?.some((c: any) => c.course_id === course.id)
          if (!hasCertificate) {
            await fetch("/api/university/certificate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ clientId, courseId: course.id }),
            })
          }
        }
      }
    }
  }

  // Calculate course progress
  const completedCount = allLectures.filter((lecture) => {
    const progress = localProgress.find((p) => p.lecture_id === lecture.id)
    return progress?.is_completed
  }).length

  const courseProgress = allLectures.length > 0 
    ? Math.round((completedCount / allLectures.length) * 100)
    : 0

  if (loading) {
    return (
      <div className="min-h-screen">
        <PortalSection gradient={false} className="relative overflow-hidden bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold"></div>
            </div>
          </div>
        </PortalSection>
      </div>
    )
  }

  if (selectedLecture) {
    return (
      <LectureViewer
        lecture={selectedLecture}
        clientId={clientId}
        courseId={courseData.id}
        onBack={() => setSelectedLecture(null)}
        onComplete={handleLectureComplete}
      />
    )
  }

  return (
    <div className="min-h-screen">
      <PortalSection gradient={false} className="relative overflow-hidden bg-white">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 text-brand-gold hover:text-brand-gold-hover"
          >
            ← Back to Program
          </Button>
          
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2" style={{ color: '#060520' }}>
                  {courseData.title}
                </h1>
                {courseData.description && (
                  <p className="text-lg text-gray-600">{courseData.description}</p>
                )}
              </div>
              {isCourseCompleted() && (
                <Badge className="bg-green-100 text-green-800 px-4 py-2">
                  <Award className="h-4 w-4 mr-2" />
                  Course Completed
                </Badge>
              )}
            </div>
            
            {courseProgress > 0 && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Course Progress</span>
                  <span className="font-medium" style={{ color: '#060520' }}>
                    {completedCount} of {allLectures.length} lectures completed ({courseProgress}%)
                  </span>
                </div>
                <Progress value={courseProgress} className="h-3" />
              </div>
            )}
          </div>

          {courseData.sections && courseData.sections.length > 0 ? (
            <div className="space-y-6">
              {courseData.sections.map((section) => (
                <Card key={section.id} className="border-gray-200">
                  <CardHeader>
                    <CardTitle style={{ color: '#060520' }}>{section.title}</CardTitle>
                    {section.description && (
                      <CardDescription>{section.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {section.lectures && section.lectures.length > 0 ? (
                      <div className="space-y-3">
                        {section.lectures.map((lecture) => {
                          const progress = localProgress.find(p => p.lecture_id === lecture.id)
                          const isCompleted = progress?.is_completed || false
                          
                          return (
                            <div
                              key={lecture.id}
                              onClick={() => setSelectedLecture(lecture)}
                              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-brand-gold/40 transition-all cursor-pointer"
                            >
                              <div className="flex items-center space-x-3 flex-1">
                                {lecture.content_type === 'video' && <Video className="h-5 w-5 text-brand-gold" />}
                                {lecture.content_type === 'text' && <FileText className="h-5 w-5 text-brand-gold" />}
                                {lecture.content_type === 'quiz' && <HelpCircle className="h-5 w-5 text-brand-gold" />}
                                {lecture.content_type === 'download' && <Download className="h-5 w-5 text-brand-gold" />}
                                {lecture.content_type === 'link' && <ExternalLink className="h-5 w-5 text-brand-gold" />}
                                
                                <div className="flex-1">
                                  <h4 className="font-medium" style={{ color: '#060520' }}>
                                    {lecture.title}
                                  </h4>
                                  {lecture.description && (
                                    <p className="text-sm text-gray-600">{lecture.description}</p>
                                  )}
                                </div>
                                
                                {isCompleted && (
                                  <CheckCircle className="h-5 w-5 text-brand-gold flex-shrink-0" />
                                )}
                                {!isCompleted && (
                                  <Play className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No lectures in this section yet.</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600">Course content is being prepared. Check back soon!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </PortalSection>
    </div>
  )
}
