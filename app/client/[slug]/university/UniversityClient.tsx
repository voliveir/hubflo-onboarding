"use client"

import { useState, useEffect } from "react"
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
  FileText,
  Download,
  ExternalLink,
  Video,
  HelpCircle,
} from "lucide-react"
import type {
  UniversitySchool,
  UniversityCourse,
  UniversityClientProgress,
  UniversityCertificate,
  UniversityLecture,
} from "@/lib/types"
import { PortalSection } from "@/components/ui/PortalSection"
import { LectureViewer } from "./LectureViewer"

interface UniversityClientProps {
  clientId: string
  clientName: string
  schools: UniversitySchool[]
  courses: UniversityCourse[]
  clientProgress: UniversityClientProgress[]
  certificates: UniversityCertificate[]
}

export function UniversityClient({
  clientId,
  clientName,
  schools,
  courses,
  clientProgress,
  certificates,
}: UniversityClientProps) {
  const [selectedSchool, setSelectedSchool] = useState<UniversitySchool | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<UniversityCourse | null>(null)
  const [viewMode, setViewMode] = useState<"overview" | "course">("overview")

  // Create progress map
  const progressMap = new Map(
    clientProgress.map(p => [p.lecture_id || p.course_id, p])
  )

  // Calculate course progress
  const getCourseProgress = (courseId: string) => {
    const courseProgress = clientProgress.filter(p => p.course_id === courseId)
    if (courseProgress.length === 0) return 0
    
    const totalProgress = courseProgress.reduce((sum, p) => sum + p.progress_percentage, 0)
    return Math.round(totalProgress / courseProgress.length)
  }

  // Check if course is completed
  const isCourseCompleted = (courseId: string) => {
    const courseProgress = clientProgress.filter(p => p.course_id === courseId && p.is_completed)
    // This is a simplified check - in reality, you'd check all lectures
    return courseProgress.length > 0
  }

  // Get courses for selected school
  const schoolCourses = selectedSchool
    ? courses.filter(c => c.school_id === selectedSchool.id)
    : courses

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

  if (viewMode === "course" && selectedCourse) {
    return (
      <CourseDetailView
        course={selectedCourse}
        clientId={clientId}
        clientProgress={clientProgress}
        onBack={() => {
          setViewMode("overview")
          setSelectedCourse(null)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <PortalSection gradient={true} className="text-white scroll-mt-32 mt-40 bg-transparent relative overflow-hidden !py-24 min-h-[40vh]">
        <div className="absolute inset-0 gradient-portal opacity-30" />
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

      {/* Schools and Courses */}
      <PortalSection gradient={false} className="relative overflow-hidden bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-2 mb-6">
              <BookOpen className="h-4 w-4 text-brand-gold" />
              <span className="text-brand-gold font-medium text-sm">Learning Path</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: '#060520' }}>
              Available Courses
            </h2>
          </div>

          {/* School Filter */}
          {schools.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2 justify-center">
              <Button
                variant={selectedSchool === null ? "default" : "outline"}
                onClick={() => setSelectedSchool(null)}
                className={selectedSchool === null ? "bg-brand-gold text-[#010124]" : ""}
              >
                All Schools
              </Button>
              {schools.map((school) => (
                <Button
                  key={school.id}
                  variant={selectedSchool?.id === school.id ? "default" : "outline"}
                  onClick={() => setSelectedSchool(school)}
                  className={selectedSchool?.id === school.id ? "bg-brand-gold text-[#010124]" : ""}
                >
                  {school.name}
                </Button>
              ))}
            </div>
          )}

          {/* Courses Grid */}
          {schoolCourses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schoolCourses.map((course) => {
                const progress = getCourseProgress(course.id)
                const completed = isCourseCompleted(course.id)
                
                return (
                  <Card
                    key={course.id}
                    className="border-gray-200 hover:border-brand-gold/40 transition-all cursor-pointer group"
                    onClick={() => {
                      setSelectedCourse(course)
                      setViewMode("course")
                    }}
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
                              {Math.round(course.estimated_duration_minutes / 60)}h {course.estimated_duration_minutes % 60}m
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
              <p className="text-lg text-gray-600">No courses available yet.</p>
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
  const [localProgress, setLocalProgress] = useState<UniversityClientProgress[]>(clientProgress)
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
    // Refresh progress
    const response = await fetch(`/api/university/progress?clientId=${clientId}&courseId=${course.id}`)
    if (response.ok) {
      const data = await response.json()
      setLocalProgress(data.data || [])
    }

    // Check if course is now completed
    if (isCourseCompleted()) {
      // Check if certificate already exists
      const certResponse = await fetch(`/api/university/certificate?clientId=${clientId}`)
      if (certResponse.ok) {
        const certData = await certResponse.json()
        const hasCertificate = certData.data?.some((c: any) => c.course_id === course.id)
        
        if (!hasCertificate) {
          // Generate certificate
          await fetch("/api/university/certificate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              clientId,
              courseId: course.id,
            }),
          })
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
            ← Back to Courses
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
