"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { formatCourseDuration } from "@/lib/utils"
import { ClickthroughDemoEditor } from "@/components/ClickthroughDemoEditor"
import {
  getUniversitySchools,
  createUniversitySchool,
  updateUniversitySchool,
  deleteUniversitySchool,
  getUniversityCourses,
  createUniversityCourse,
  updateUniversityCourse,
  deleteUniversityCourse,
  getUniversitySections,
  createUniversitySection,
  updateUniversitySection,
  deleteUniversitySection,
  getUniversityLectures,
  createUniversityLecture,
  updateUniversityLecture,
  deleteUniversityLecture,
  getUniversityQuizzes,
  createUniversityQuiz,
  updateUniversityQuiz,
  deleteUniversityQuiz,
  getUniversityOnboardingQuestionsAdmin,
  createUniversityOnboardingQuestion,
  updateUniversityOnboardingQuestion,
  deleteUniversityOnboardingQuestion,
} from "@/lib/database"
import type {
  UniversitySchool,
  UniversityCourse,
  UniversitySection,
  UniversityLecture,
  UniversityQuiz,
  UniversityOnboardingQuestion,
  UniversityOnboardingQuestionOption,
} from "@/lib/types"
import {
  GraduationCap,
  BookOpen,
  FileText,
  HelpCircle,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  Video,
  Download,
  ExternalLink,
  ListChecks,
  MousePointerClick,
} from "lucide-react"

export function UniversityManager() {
  const [schools, setSchools] = useState<UniversitySchool[]>([])
  const [courses, setCourses] = useState<UniversityCourse[]>([])
  const [sections, setSections] = useState<UniversitySection[]>([])
  const [lectures, setLectures] = useState<UniversityLecture[]>([])
  const [quizzes, setQuizzes] = useState<UniversityQuiz[]>([])
  
  const [loading, setLoading] = useState(true)
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  
  // Dialog states
  const [isSchoolDialogOpen, setIsSchoolDialogOpen] = useState(false)
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false)
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false)
  const [isLectureDialogOpen, setIsLectureDialogOpen] = useState(false)
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false)
  
  const [editingSchool, setEditingSchool] = useState<UniversitySchool | null>(null)
  const [editingCourse, setEditingCourse] = useState<UniversityCourse | null>(null)
  const [editingSection, setEditingSection] = useState<UniversitySection | null>(null)
  const [editingLecture, setEditingLecture] = useState<UniversityLecture | null>(null)
  const [editingQuiz, setEditingQuiz] = useState<UniversityQuiz | null>(null)
  const [onboardingQuestions, setOnboardingQuestions] = useState<UniversityOnboardingQuestion[]>([])
  const [isOnboardingDialogOpen, setIsOnboardingDialogOpen] = useState(false)
  const [editingOnboardingQuestion, setEditingOnboardingQuestion] = useState<UniversityOnboardingQuestion | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedCourse) {
      loadSections(selectedCourse)
    }
  }, [selectedCourse])

  useEffect(() => {
    if (selectedSection) {
      loadLectures(selectedSection)
    }
  }, [selectedSection])

  const loadData = async () => {
    try {
      setLoading(true)
      const [schoolsData, coursesData, quizzesData, onboardingData] = await Promise.all([
        getUniversitySchools(),
        getUniversityCourses(),
        getUniversityQuizzes(),
        getUniversityOnboardingQuestionsAdmin(),
      ])
      setSchools(schoolsData)
      setCourses(coursesData)
      setQuizzes(quizzesData)
      setOnboardingQuestions(onboardingData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "Failed to load University data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadSections = async (courseId: string) => {
    try {
      const data = await getUniversitySections(courseId)
      setSections(data)
    } catch (error) {
      console.error("Error loading sections:", error)
    }
  }

  const loadLectures = async (sectionId: string) => {
    try {
      const data = await getUniversityLectures(sectionId)
      setLectures(data)
    } catch (error) {
      console.error("Error loading lectures:", error)
    }
  }

  // School handlers
  const handleCreateSchool = async (data: Omit<UniversitySchool, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createUniversitySchool(data)
      await loadData()
      setIsSchoolDialogOpen(false)
      toast({ title: "Success", description: "School created successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to create school", variant: "destructive" })
    }
  }

  const handleUpdateSchool = async (id: string, updates: Partial<UniversitySchool>) => {
    try {
      await updateUniversitySchool(id, updates)
      await loadData()
      setEditingSchool(null)
      toast({ title: "Success", description: "School updated successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to update school", variant: "destructive" })
    }
  }

  const handleDeleteSchool = async (id: string) => {
    if (confirm("Are you sure you want to delete this school? All courses will be deleted.")) {
      try {
        await deleteUniversitySchool(id)
        await loadData()
        toast({ title: "Success", description: "School deleted successfully" })
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete school", variant: "destructive" })
      }
    }
  }

  // Course handlers
  const handleCreateCourse = async (data: Omit<UniversityCourse, 'id' | 'created_at' | 'updated_at' | 'school' | 'sections'>) => {
    try {
      await createUniversityCourse(data)
      await loadData()
      setIsCourseDialogOpen(false)
      toast({ title: "Success", description: "Course created successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to create course", variant: "destructive" })
    }
  }

  const handleUpdateCourse = async (id: string, updates: Partial<UniversityCourse>) => {
    try {
      await updateUniversityCourse(id, updates)
      await loadData()
      setEditingCourse(null)
      toast({ title: "Success", description: "Course updated successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to update course", variant: "destructive" })
    }
  }

  const handleDeleteCourse = async (id: string) => {
    if (confirm("Are you sure you want to delete this course? All sections and lectures will be deleted.")) {
      try {
        await deleteUniversityCourse(id)
        await loadData()
        toast({ title: "Success", description: "Course deleted successfully" })
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete course", variant: "destructive" })
      }
    }
  }

  // Section handlers
  const handleCreateSection = async (data: Omit<UniversitySection, 'id' | 'created_at' | 'updated_at' | 'course' | 'lectures'>) => {
    try {
      await createUniversitySection(data)
      if (selectedCourse) await loadSections(selectedCourse)
      setIsSectionDialogOpen(false)
      toast({ title: "Success", description: "Section created successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to create section", variant: "destructive" })
    }
  }

  const handleUpdateSection = async (id: string, updates: Partial<UniversitySection>) => {
    try {
      await updateUniversitySection(id, updates)
      if (selectedCourse) await loadSections(selectedCourse)
      setEditingSection(null)
      toast({ title: "Success", description: "Section updated successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to update section", variant: "destructive" })
    }
  }

  const handleDeleteSection = async (id: string) => {
    if (confirm("Are you sure you want to delete this section? All lectures will be deleted.")) {
      try {
        await deleteUniversitySection(id)
        if (selectedCourse) await loadSections(selectedCourse)
        toast({ title: "Success", description: "Section deleted successfully" })
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete section", variant: "destructive" })
      }
    }
  }

  // Lecture handlers
  const handleCreateLecture = async (data: Omit<UniversityLecture, 'id' | 'created_at' | 'updated_at' | 'section'>) => {
    try {
      await createUniversityLecture(data)
      if (selectedSection) await loadLectures(selectedSection)
      setIsLectureDialogOpen(false)
      toast({ title: "Success", description: "Lecture created successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to create lecture", variant: "destructive" })
    }
  }

  const handleUpdateLecture = async (id: string, updates: Partial<UniversityLecture>) => {
    try {
      await updateUniversityLecture(id, updates)
      if (selectedSection) await loadLectures(selectedSection)
      setEditingLecture(null)
      toast({ title: "Success", description: "Lecture updated successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to update lecture", variant: "destructive" })
    }
  }

  const handleDeleteLecture = async (id: string) => {
    if (confirm("Are you sure you want to delete this lecture?")) {
      try {
        await deleteUniversityLecture(id)
        if (selectedSection) await loadLectures(selectedSection)
        toast({ title: "Success", description: "Lecture deleted successfully" })
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete lecture", variant: "destructive" })
      }
    }
  }

  // Quiz handlers
  const handleCreateQuiz = async (data: Omit<UniversityQuiz, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log("Creating quiz with data:", data)
      // Ensure questions is always an array
      const quizData = {
        ...data,
        questions: Array.isArray(data.questions) ? data.questions : [],
      }
      await createUniversityQuiz(quizData)
      await loadData()
      setIsQuizDialogOpen(false)
      setEditingQuiz(null)
      toast({ title: "Success", description: "Quiz created successfully" })
    } catch (error: any) {
      console.error("Error creating quiz:", error)
      toast({ 
        title: "Error", 
        description: error?.message || "Failed to create quiz. Please check the browser console for details.", 
        variant: "destructive" 
      })
    }
  }

  const handleUpdateQuiz = async (id: string, updates: Partial<UniversityQuiz>) => {
    try {
      console.log("Updating quiz with id:", id, "updates:", updates)
      // Ensure questions is always an array if provided
      const updateData = {
        ...updates,
        ...(updates.questions && { questions: Array.isArray(updates.questions) ? updates.questions : [] }),
      }
      await updateUniversityQuiz(id, updateData)
      await loadData()
      setEditingQuiz(null)
      setIsQuizDialogOpen(false)
      toast({ title: "Success", description: "Quiz updated successfully" })
    } catch (error: any) {
      console.error("Error updating quiz:", error)
      toast({ 
        title: "Error", 
        description: error?.message || "Failed to update quiz. Please check the browser console for details.", 
        variant: "destructive" 
      })
    }
  }

  const handleDeleteQuiz = async (id: string) => {
    if (confirm("Are you sure you want to delete this quiz?")) {
      try {
        await deleteUniversityQuiz(id)
        await loadData()
        toast({ title: "Success", description: "Quiz deleted successfully" })
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete quiz", variant: "destructive" })
      }
    }
  }

  const handleCreateOnboardingQuestion = async (data: Omit<UniversityOnboardingQuestion, "id" | "created_at" | "updated_at">) => {
    try {
      await createUniversityOnboardingQuestion(data)
      await loadData()
      setIsOnboardingDialogOpen(false)
      toast({ title: "Success", description: "Onboarding question created" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to create question", variant: "destructive" })
    }
  }

  const handleUpdateOnboardingQuestion = async (id: string, updates: Partial<UniversityOnboardingQuestion>) => {
    try {
      await updateUniversityOnboardingQuestion(id, updates)
      await loadData()
      setEditingOnboardingQuestion(null)
      setIsOnboardingDialogOpen(false)
      toast({ title: "Success", description: "Onboarding question updated" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to update question", variant: "destructive" })
    }
  }

  const handleDeleteOnboardingQuestion = async (id: string) => {
    if (confirm("Are you sure you want to delete this onboarding question?")) {
      try {
        await deleteUniversityOnboardingQuestion(id)
        await loadData()
        toast({ title: "Success", description: "Onboarding question deleted" })
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete question", variant: "destructive" })
      }
    }
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />
      case 'text': return <FileText className="h-4 w-4" />
      case 'quiz': return <HelpCircle className="h-4 w-4" />
      case 'download': return <Download className="h-4 w-4" />
      case 'link': return <ExternalLink className="h-4 w-4" />
      case 'clickthrough_demo': return <MousePointerClick className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="schools" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="schools">
            <GraduationCap className="h-4 w-4 mr-2" />
            Schools
          </TabsTrigger>
          <TabsTrigger value="courses">
            <BookOpen className="h-4 w-4 mr-2" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="sections">
            <FileText className="h-4 w-4 mr-2" />
            Sections
          </TabsTrigger>
          <TabsTrigger value="lectures">
            <Video className="h-4 w-4 mr-2" />
            Lectures
          </TabsTrigger>
          <TabsTrigger value="quizzes">
            <HelpCircle className="h-4 w-4 mr-2" />
            Quizzes
          </TabsTrigger>
          <TabsTrigger value="onboarding">
            <ListChecks className="h-4 w-4 mr-2" />
            Onboarding
          </TabsTrigger>
        </TabsList>

        {/* Schools Tab */}
        <TabsContent value="schools" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold" style={{ color: '#060520' }}>Schools</h2>
            <Button onClick={() => { setEditingSchool(null); setIsSchoolDialogOpen(true) }}>
              <Plus className="h-4 w-4 mr-2" />
              New School
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schools.map((school) => (
              <Card key={school.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle style={{ color: '#060520' }}>{school.name}</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingSchool(school); setIsSchoolDialogOpen(true) }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteSchool(school.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  {school.description && <CardDescription>{school.description}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant={school.is_active ? "default" : "secondary"}>
                      {school.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <span className="text-sm text-gray-500">Order: {school.sort_order}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold" style={{ color: '#060520' }}>Courses</h2>
            <Button onClick={() => { setEditingCourse(null); setIsCourseDialogOpen(true) }}>
              <Plus className="h-4 w-4 mr-2" />
              New Course
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle style={{ color: '#060520' }}>{course.title}</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingCourse(course); setIsCourseDialogOpen(true) }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteCourse(course.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  {course.description && <CardDescription>{course.description}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={course.is_active ? "default" : "secondary"}>
                        {course.is_active ? "Active" : "Inactive"}
                      </Badge>
                      {course.difficulty_level && (
                        <Badge variant="outline">{course.difficulty_level}</Badge>
                      )}
                    </div>
                    {course.estimated_duration_minutes && (
                      <p className="text-sm text-gray-500">
                        Duration: {formatCourseDuration(course.estimated_duration_minutes)}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold" style={{ color: '#060520' }}>Sections</h2>
            <div className="flex gap-2">
              <Select value={selectedCourse || ""} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-64 text-[#060520] bg-white border-gray-300">
                  <SelectValue placeholder="Select a course" className="text-[#060520]" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id} className="text-[#060520] focus:text-[#060520] focus:bg-gray-100 cursor-pointer">
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={() => { setEditingSection(null); setIsSectionDialogOpen(true) }}
                disabled={!selectedCourse}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Section
              </Button>
            </div>
          </div>
          {selectedCourse ? (
            <div className="space-y-4">
              {sections.map((section) => (
                <Card key={section.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle style={{ color: '#060520' }}>{section.title}</CardTitle>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setEditingSection(section); setIsSectionDialogOpen(true) }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteSection(section.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    {section.description && <CardDescription>{section.description}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <Badge variant={section.is_active ? "default" : "secondary"}>
                      {section.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">Please select a course to view sections</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Lectures Tab */}
        <TabsContent value="lectures" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold" style={{ color: '#060520' }}>Lectures</h2>
            <div className="flex gap-2">
              <Select value={selectedSection || ""} onValueChange={setSelectedSection}>
                <SelectTrigger className="w-64 text-[#060520] bg-white border-gray-300">
                  <SelectValue placeholder="Select a section" className="text-[#060520]" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id} className="text-[#060520] focus:text-[#060520] focus:bg-gray-100 cursor-pointer">
                      {section.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={() => { setEditingLecture(null); setIsLectureDialogOpen(true) }}
                disabled={!selectedSection}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Lecture
              </Button>
            </div>
          </div>
          {selectedSection ? (
            <div className="space-y-4">
              {lectures.map((lecture) => {
                const contentData = lecture.content_data || {}
                const hasVideo = contentData.video?.url || (lecture.content_type === "video" && contentData.url)
                const hasText = contentData.text?.content || (lecture.content_type === "text" && contentData.content)
                const hasBoth = hasVideo && hasText
                
                return (
                  <Card key={lecture.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          {hasBoth ? (
                            <>
                              <Video className="h-4 w-4" />
                              <FileText className="h-4 w-4" />
                            </>
                          ) : (
                            getContentTypeIcon(lecture.content_type)
                          )}
                          <CardTitle style={{ color: '#060520' }}>{lecture.title}</CardTitle>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => { setEditingLecture(lecture); setIsLectureDialogOpen(true) }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteLecture(lecture.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      {lecture.description && <CardDescription>{lecture.description}</CardDescription>}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {hasBoth ? (
                            <Badge variant="outline">Video + Text</Badge>
                          ) : (
                            <Badge variant="outline">{lecture.content_type === "clickthrough_demo" ? "Labs demo" : lecture.content_type}</Badge>
                          )}
                          {hasVideo && !hasBoth && <Badge variant="secondary" className="text-xs">Video</Badge>}
                          {hasText && !hasBoth && <Badge variant="secondary" className="text-xs">Text</Badge>}
                        </div>
                        <Badge variant={lecture.is_active ? "default" : "secondary"}>
                          {lecture.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">Please select a section to view lectures</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Quizzes Tab */}
        <TabsContent value="quizzes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold" style={{ color: '#060520' }}>Quizzes</h2>
            <Button onClick={() => { setEditingQuiz(null); setIsQuizDialogOpen(true) }}>
              <Plus className="h-4 w-4 mr-2" />
              New Quiz
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((quiz) => (
              <Card key={quiz.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle style={{ color: '#060520' }}>{quiz.title}</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingQuiz(quiz); setIsQuizDialogOpen(true) }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteQuiz(quiz.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  {quiz.description && <CardDescription>{quiz.description}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={quiz.is_active ? "default" : "secondary"}>
                        {quiz.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <span className="text-sm text-gray-500">Pass: {quiz.passing_score}%</span>
                    </div>
                    {quiz.time_limit_minutes && (
                      <p className="text-sm text-gray-500">Time Limit: {quiz.time_limit_minutes} min</p>
                    )}
                    <p className="text-sm text-gray-500">
                      Questions: {Array.isArray(quiz.questions) ? quiz.questions.length : 0}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Onboarding Tab - first-time form questions and recommended programs */}
        <TabsContent value="onboarding" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold" style={{ color: '#060520' }}>Onboarding Questions</h2>
            <Button onClick={() => { setEditingOnboardingQuestion(null); setIsOnboardingDialogOpen(true) }}>
              <Plus className="h-4 w-4 mr-2" />
              New Question
            </Button>
          </div>
          <p className="text-gray-600 max-w-2xl">
            These questions are shown when a client enters Hubflo Labs for the first time. For each answer option you can assign which programs (schools) to recommend. Phase 1 = workspace &amp; Hubflo, Phase 2 = billing &amp; integrations, Phase 3 = everything else.
          </p>
          <div className="space-y-4">
            {onboardingQuestions.map((q) => (
              <Card key={q.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">Phase {q.phase}</Badge>
                        <Badge variant={q.is_active ? "default" : "secondary"}>{q.is_active ? "Active" : "Inactive"}</Badge>
                        <span className="text-sm text-gray-500">Order: {q.sort_order}</span>
                      </div>
                      <CardTitle style={{ color: '#060520' }} className="text-lg">{q.title}</CardTitle>
                      <CardDescription className="mt-1">{q.question_text}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingOnboardingQuestion(q); setIsOnboardingDialogOpen(true) }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteOnboardingQuestion(q.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-2">Options → recommended programs & courses:</p>
                  <ul className="text-sm space-y-1">
                    {(q.options || []).map((opt) => (
                      <li key={opt.value}>
                        <strong>{opt.label}</strong>
                        {(opt.recommended_school_ids?.length || opt.recommended_course_ids?.length)
                          ? ` → ${opt.recommended_school_ids?.length || 0} program(s), ${opt.recommended_course_ids?.length || 0} course(s)`
                          : " (none)"}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* School Dialog */}
      <SchoolDialog
        open={isSchoolDialogOpen}
        onOpenChange={setIsSchoolDialogOpen}
        school={editingSchool}
        onboardingQuestions={onboardingQuestions}
        onSubmit={editingSchool ? (data) => handleUpdateSchool(editingSchool.id, data) : handleCreateSchool}
      />

      {/* Course Dialog */}
      <CourseDialog
        open={isCourseDialogOpen}
        onOpenChange={setIsCourseDialogOpen}
        course={editingCourse}
        schools={schools}
        onSubmit={editingCourse ? (data) => handleUpdateCourse(editingCourse.id, data) : handleCreateCourse}
      />

      {/* Section Dialog */}
      <SectionDialog
        open={isSectionDialogOpen}
        onOpenChange={setIsSectionDialogOpen}
        section={editingSection}
        courseId={selectedCourse}
        courses={courses}
        onSubmit={editingSection ? (data) => handleUpdateSection(editingSection.id, data) : handleCreateSection}
      />

      {/* Lecture Dialog */}
      <LectureDialog
        open={isLectureDialogOpen}
        onOpenChange={setIsLectureDialogOpen}
        lecture={editingLecture}
        sectionId={selectedSection}
        sections={sections}
        onSubmit={editingLecture ? (data) => handleUpdateLecture(editingLecture.id, data) : handleCreateLecture}
      />

      {/* Quiz Dialog */}
      <QuizDialog
        open={isQuizDialogOpen}
        onOpenChange={setIsQuizDialogOpen}
        quiz={editingQuiz}
        courses={courses}
        onSubmit={editingQuiz ? (data) => handleUpdateQuiz(editingQuiz.id, data) : handleCreateQuiz}
      />

      {/* Onboarding Question Dialog */}
      <OnboardingQuestionDialog
        open={isOnboardingDialogOpen}
        onOpenChange={(open) => {
          setIsOnboardingDialogOpen(open)
          if (!open) setEditingOnboardingQuestion(null)
        }}
        question={editingOnboardingQuestion}
        schools={schools}
        courses={courses}
        onSubmit={editingOnboardingQuestion
          ? (data) => handleUpdateOnboardingQuestion(editingOnboardingQuestion.id, data)
          : handleCreateOnboardingQuestion
        }
      />
    </div>
  )
}

// Dialog Components
function SchoolDialog({
  open,
  onOpenChange,
  school,
  onboardingQuestions,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  school: UniversitySchool | null
  onboardingQuestions: UniversityOnboardingQuestion[]
  onSubmit: (data: Omit<UniversitySchool, 'id' | 'created_at' | 'updated_at'>) => void
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: "",
    sort_order: 0,
    phase: 1 as 1 | 2 | 3,
    recommend_when_yes_to_question_keys: [] as string[],
    is_active: true,
  })

  useEffect(() => {
    if (school) {
      setFormData({
        name: school.name,
        description: school.description || "",
        image_url: school.image_url || "",
        sort_order: school.sort_order,
        phase: (school.phase ?? 1) as 1 | 2 | 3,
        recommend_when_yes_to_question_keys: school.recommend_when_yes_to_question_keys ?? [],
        is_active: school.is_active,
      })
    } else {
      setFormData({
        name: "",
        description: "",
        image_url: "",
        sort_order: 0,
        phase: 1,
        recommend_when_yes_to_question_keys: [],
        is_active: true,
      })
    }
  }, [school, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[#060520]">{school ? "Edit School" : "Create School"}</DialogTitle>
          <DialogDescription className="text-gray-600">Manage school information</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-[#060520]">Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="text-[#060520] placeholder:text-gray-400"
            />
          </div>
          <div>
            <Label className="text-[#060520]">Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="text-[#060520] placeholder:text-gray-400"
            />
          </div>
          <div>
            <Label className="text-[#060520]">Image URL</Label>
            <Input
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              type="url"
              className="text-[#060520] placeholder:text-gray-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[#060520]">Phase (where this program appears in client recommendations)</Label>
              <Select
                value={String(formData.phase)}
                onValueChange={(v) => setFormData({ ...formData, phase: Number(v) as 1 | 2 | 3 })}
              >
                <SelectTrigger className="text-[#060520]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1" className="text-[#060520]">Phase 1 – Start (workspace & Hubflo)</SelectItem>
                  <SelectItem value="2" className="text-[#060520]">Phase 2 – Middle (billing & integrations)</SelectItem>
                  <SelectItem value="3" className="text-[#060520]">Phase 3 – End (automations & rest)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">Choose which block (Phase 1, 2, or 3) this program shows under on the client&apos;s &quot;Your implementation path&quot;.</p>
            </div>
            <div>
              <Label className="text-[#060520]">Sort Order</Label>
              <Input
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                type="number"
                className="text-[#060520] placeholder:text-gray-400"
              />
            </div>
          </div>
          <div>
            <Label className="text-[#060520]">Recommend this program when client answers Yes to all of:</Label>
            <p className="text-sm text-gray-500 mb-2">If the client says Yes to every question you select below, this program will be recommended (in addition to any per-question recommendations).</p>
            <div className="border rounded-lg p-4 bg-gray-50 space-y-2 max-h-48 overflow-y-auto">
              {onboardingQuestions.length === 0 ? (
                <p className="text-sm text-gray-500">No onboarding questions yet. Add questions in the Onboarding tab first.</p>
              ) : (
                onboardingQuestions.map((q) => {
                  const selected = formData.recommend_when_yes_to_question_keys.includes(q.question_key)
                  return (
                    <label key={q.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={selected}
                        onCheckedChange={(checked) => {
                          setFormData((prev) => ({
                            ...prev,
                            recommend_when_yes_to_question_keys: checked
                              ? [...prev.recommend_when_yes_to_question_keys, q.question_key]
                              : prev.recommend_when_yes_to_question_keys.filter((k) => k !== q.question_key),
                          }))
                        }}
                      />
                      <span className="text-[#060520]">{q.title}</span>
                      <span className="text-xs text-gray-400">({q.question_key})</span>
                    </label>
                  )
                })
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label className="text-[#060520]">Active</Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function CourseDialog({
  open,
  onOpenChange,
  course,
  schools,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: UniversityCourse | null
  schools: UniversitySchool[]
  onSubmit: (data: Omit<UniversityCourse, 'id' | 'created_at' | 'updated_at' | 'school' | 'sections'>) => void
}) {
  const [formData, setFormData] = useState({
    school_id: "",
    title: "",
    description: "",
    image_url: "",
    estimated_duration_minutes: 0,
    difficulty_level: "beginner" as "beginner" | "intermediate" | "advanced",
    sort_order: 0,
    is_active: true,
  })

  useEffect(() => {
    if (course) {
      setFormData({
        school_id: course.school_id,
        title: course.title,
        description: course.description || "",
        image_url: course.image_url || "",
        estimated_duration_minutes: course.estimated_duration_minutes || 0,
        difficulty_level: course.difficulty_level || "beginner",
        sort_order: course.sort_order,
        is_active: course.is_active,
      })
    } else {
      setFormData({
        school_id: schools[0]?.id || "",
        title: "",
        description: "",
        image_url: "",
        estimated_duration_minutes: 0,
        difficulty_level: "beginner",
        sort_order: 0,
        is_active: true,
      })
    }
  }, [course, open, schools])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#060520]">{course ? "Edit Course" : "Create Course"}</DialogTitle>
          <DialogDescription className="text-gray-600">Manage course information</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-[#060520]">School</Label>
            <Select value={formData.school_id} onValueChange={(value) => setFormData({ ...formData, school_id: value })}>
              <SelectTrigger className="text-[#060520] placeholder:text-gray-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="text-[#060520]">
                {schools.map((school) => (
                  <SelectItem key={school.id} value={school.id} className="text-[#060520]">{school.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[#060520]">Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="text-[#060520] placeholder:text-gray-400"
            />
          </div>
          <div>
            <Label className="text-[#060520]">Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="text-[#060520] placeholder:text-gray-400"
            />
          </div>
          <div>
            <Label className="text-[#060520]">Image URL</Label>
            <Input
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              type="url"
              className="text-[#060520] placeholder:text-gray-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[#060520]">Estimated Duration (minutes)</Label>
              <Input
                value={formData.estimated_duration_minutes}
                onChange={(e) => setFormData({ ...formData, estimated_duration_minutes: parseInt(e.target.value) || 0 })}
                type="number"
                className="text-[#060520] placeholder:text-gray-400"
              />
            </div>
            <div>
              <Label className="text-[#060520]">Difficulty Level</Label>
              <Select value={formData.difficulty_level} onValueChange={(value: any) => setFormData({ ...formData, difficulty_level: value })}>
                <SelectTrigger className="text-[#060520] placeholder:text-gray-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-[#060520]">
                  <SelectItem value="beginner" className="text-[#060520]">Beginner</SelectItem>
                  <SelectItem value="intermediate" className="text-[#060520]">Intermediate</SelectItem>
                  <SelectItem value="advanced" className="text-[#060520]">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[#060520]">Sort Order</Label>
              <Input
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                type="number"
                className="text-[#060520] placeholder:text-gray-400"
              />
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label className="text-[#060520]">Active</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function SectionDialog({
  open,
  onOpenChange,
  section,
  courseId,
  courses,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  section: UniversitySection | null
  courseId: string | null
  courses: UniversityCourse[]
  onSubmit: (data: Omit<UniversitySection, 'id' | 'created_at' | 'updated_at' | 'course' | 'lectures'>) => void
}) {
  const [formData, setFormData] = useState({
    course_id: "",
    title: "",
    description: "",
    sort_order: 0,
    is_active: true,
  })

  useEffect(() => {
    if (section) {
      setFormData({
        course_id: section.course_id,
        title: section.title,
        description: section.description || "",
        sort_order: section.sort_order,
        is_active: section.is_active,
      })
    } else {
      setFormData({
        course_id: courseId || courses[0]?.id || "",
        title: "",
        description: "",
        sort_order: 0,
        is_active: true,
      })
    }
  }, [section, open, courseId, courses])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[#060520]">{section ? "Edit Section" : "Create Section"}</DialogTitle>
          <DialogDescription className="text-gray-600">Manage section information</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-[#060520]">Course</Label>
            <Select value={formData.course_id} onValueChange={(value) => setFormData({ ...formData, course_id: value })}>
              <SelectTrigger className="text-[#060520] placeholder:text-gray-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="text-[#060520]">
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id} className="text-[#060520]">{course.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[#060520]">Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="text-[#060520] placeholder:text-gray-400"
            />
          </div>
          <div>
            <Label className="text-[#060520]">Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="text-[#060520] placeholder:text-gray-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[#060520]">Sort Order</Label>
              <Input
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                type="number"
                className="text-[#060520] placeholder:text-gray-400"
              />
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label className="text-[#060520]">Active</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function LectureDialog({
  open,
  onOpenChange,
  lecture,
  sectionId,
  sections,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  lecture: UniversityLecture | null
  sectionId: string | null
  sections: UniversitySection[]
  onSubmit: (data: Omit<UniversityLecture, 'id' | 'created_at' | 'updated_at' | 'section'>) => void
}) {
  const [formData, setFormData] = useState({
    section_id: "",
    title: "",
    description: "",
    content_type: "video" as "video" | "text" | "quiz" | "download" | "link" | "clickthrough_demo",
    content_data: {} as any,
    sort_order: 0,
    is_active: true,
  })
  const [videoUrl, setVideoUrl] = useState("")
  const [textContent, setTextContent] = useState("")
  const [textFormat, setTextFormat] = useState<"markdown" | "html">("markdown")
  const [hasVideo, setHasVideo] = useState(false)
  const [hasText, setHasText] = useState(false)

  // Helper function to detect video provider and format content_data
  const parseVideoUrl = (url: string) => {
    if (!url || url.trim() === "") {
      return { url: "", provider: "custom" }
    }

    // YouTube detection
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const youtubeMatch = url.match(youtubeRegex)
    if (youtubeMatch) {
      return {
        url: url,
        provider: "youtube",
      }
    }

    // Vimeo detection
    const vimeoRegex = /(?:vimeo\.com\/)(\d+)/
    const vimeoMatch = url.match(vimeoRegex)
    if (vimeoMatch) {
      return {
        url: url,
        provider: "vimeo",
      }
    }

    // Tella detection
    if (url.includes("tella.tv")) {
      return {
        url: url,
        provider: "tella",
      }
    }

    // Default to custom
    return {
      url: url,
      provider: "custom",
    }
  }

  useEffect(() => {
    if (lecture) {
      const contentData = lecture.content_data || {}
      setFormData({
        section_id: lecture.section_id,
        title: lecture.title,
        description: lecture.description || "",
        content_type: lecture.content_type,
        content_data: contentData,
        sort_order: lecture.sort_order,
        is_active: lecture.is_active,
      })
      
      // Check if lecture has video or text (new structure)
      const hasVideoContent = contentData.video?.url || (lecture.content_type === "video" && contentData.url)
      const hasTextContent = contentData.text?.content || (lecture.content_type === "text" && contentData.content)
      
      setHasVideo(!!hasVideoContent)
      setHasText(!!hasTextContent)
      
      // Set video URL
      if (contentData.video?.url) {
        setVideoUrl(contentData.video.url)
      } else if (lecture.content_type === "video" && contentData.url) {
        setVideoUrl(contentData.url)
      } else {
        setVideoUrl("")
      }
      
      // Set text content
      if (contentData.text?.content) {
        setTextContent(contentData.text.content)
        setTextFormat(contentData.text.format || "markdown")
      } else if (lecture.content_type === "text" && contentData.content) {
        setTextContent(contentData.content)
        setTextFormat(contentData.format || "markdown")
      } else {
        setTextContent("")
        setTextFormat("markdown")
      }
    } else {
      setFormData({
        section_id: sectionId || sections[0]?.id || "",
        title: "",
        description: "",
        content_type: "video",
        content_data: {},
        sort_order: 0,
        is_active: true,
      })
      setVideoUrl("")
      setTextContent("")
      setTextFormat("markdown")
      setHasVideo(false)
      setHasText(false)
    }
  }, [lecture, open, sectionId, sections])

  // Update content_data when video URL or text content changes (only for video/text lectures)
  useEffect(() => {
    if (formData.content_type === "clickthrough_demo") return
    const newContentData: any = {}
    
    if (hasVideo && videoUrl) {
      const parsed = parseVideoUrl(videoUrl)
      newContentData.video = parsed
    }
    
    if (hasText && textContent) {
      newContentData.text = {
        content: textContent,
        format: textFormat,
      }
    }
    
    // Determine content_type based on what's enabled
    let newContentType = formData.content_type
    if (hasVideo && hasText) {
      newContentType = "video" // Default to video when both are present
    } else if (hasVideo) {
      newContentType = "video"
    } else if (hasText) {
      newContentType = "text"
    }
    
    setFormData(prev => ({
      ...prev,
      content_type: newContentType,
      content_data: Object.keys(newContentData).length > 0 ? newContentData : {},
    }))
  }, [videoUrl, textContent, textFormat, hasVideo, hasText, formData.content_type])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#060520]">{lecture ? "Edit Lecture" : "Create Lecture"}</DialogTitle>
          <DialogDescription className="text-gray-600">Manage lecture content</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-[#060520]">Section</Label>
            <Select value={formData.section_id} onValueChange={(value) => setFormData({ ...formData, section_id: value })}>
              <SelectTrigger className="text-[#060520] placeholder:text-gray-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="text-[#060520]">
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.id} className="text-[#060520]">{section.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[#060520]">Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="text-[#060520] placeholder:text-gray-400"
            />
          </div>
          <div>
            <Label className="text-[#060520]">Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="text-[#060520] placeholder:text-gray-400"
            />
          </div>
          <div>
            <Label className="text-[#060520]">Content Type</Label>
            <Select value={formData.content_type} onValueChange={(value: any) => {
              // Only allow changing to quiz, download, link, or clickthrough_demo - video/text are controlled by toggles
              if (value === "quiz" || value === "download" || value === "link") {
                setFormData({ ...formData, content_type: value, content_data: {} })
                setHasVideo(false)
                setHasText(false)
                setVideoUrl("")
                setTextContent("")
              } else if (value === "clickthrough_demo") {
                setFormData({ ...formData, content_type: value, content_data: { steps: [] } })
                setHasVideo(false)
                setHasText(false)
                setVideoUrl("")
                setTextContent("")
              }
            }}>
              <SelectTrigger className="text-[#060520] placeholder:text-gray-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="text-[#060520]">
                <SelectItem value="video" className="text-[#060520]">Video/Text (use toggles below)</SelectItem>
                <SelectItem value="quiz" className="text-[#060520]">Quiz</SelectItem>
                <SelectItem value="download" className="text-[#060520]">Download</SelectItem>
                <SelectItem value="link" className="text-[#060520]">Link</SelectItem>
                <SelectItem value="clickthrough_demo" className="text-[#060520]">Labs – Click-through demo</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              For video and text content, use the toggles below. You can include both in the same lecture.
            </p>
          </div>

          {/* Video and Text Content Toggles - Only show for video/text types */}
          {(formData.content_type === "video" || formData.content_type === "text") && (
            <div className="space-y-4 border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={hasVideo}
                    onCheckedChange={setHasVideo}
                  />
                  <Label className="text-[#060520]">Include Video</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={hasText}
                    onCheckedChange={setHasText}
                  />
                  <Label className="text-[#060520]">Include Text Content</Label>
                </div>
              </div>

              {/* Video URL Input */}
              {hasVideo && (
                <div>
                  <Label className="text-[#060520]">Video URL</Label>
                  <Input
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtu.be/WZ3hTvi5Mfs or https://www.youtube.com/watch?v=..."
                    className="text-[#060520] placeholder:text-gray-400"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supports YouTube (youtube.com or youtu.be), Vimeo, Tella, and other video URLs. 
                    The provider will be automatically detected.
                  </p>
                  {videoUrl && formData.content_data?.video?.provider && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Detected: {formData.content_data.video.provider === "youtube" ? "YouTube" : 
                                    formData.content_data.video.provider === "vimeo" ? "Vimeo" :
                                    formData.content_data.video.provider === "tella" ? "Tella" : "Custom"} video
                    </p>
                  )}
                </div>
              )}

              {/* Text Content Input */}
              {hasText && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-[#060520] font-semibold">Text Content</Label>
                    <Select value={textFormat} onValueChange={(value: "markdown" | "html") => setTextFormat(value)}>
                      <SelectTrigger className="w-32 text-[#060520] bg-white border-gray-300">
                        <SelectValue className="text-[#060520]" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-300">
                        <SelectItem value="markdown" className="text-[#060520] focus:text-[#060520] focus:bg-gray-100 cursor-pointer">
                          Markdown
                        </SelectItem>
                        <SelectItem value="html" className="text-[#060520] focus:text-[#060520] focus:bg-gray-100 cursor-pointer">
                          HTML
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="Enter text content for clients who prefer reading..."
                    rows={16}
                    className={`text-[#060520] placeholder:text-gray-400 text-sm leading-relaxed ${
                      textFormat === "html" || textFormat === "markdown" 
                        ? "font-mono bg-gray-50 border-2 border-gray-300 focus:border-brand-gold" 
                        : ""
                    }`}
                    style={{
                      fontSize: '14px',
                      lineHeight: '1.6',
                      fontFamily: textFormat === "html" || textFormat === "markdown" ? 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace' : 'inherit'
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This text content will be displayed alongside or instead of the video for clients who prefer reading.
                    {textFormat === "html" && (
                      <>
                        {" You can use HTML tags for formatting (e.g., "}
                        <code className="text-xs bg-gray-100 px-1 rounded">&lt;p&gt;</code>
                        {", "}
                        <code className="text-xs bg-gray-100 px-1 rounded">&lt;strong&gt;</code>
                        {", "}
                        <code className="text-xs bg-gray-100 px-1 rounded">&lt;ul&gt;</code>
                        {", "}
                        <code className="text-xs bg-gray-100 px-1 rounded">&lt;li&gt;</code>
                        {"). "}
                        <strong>To add images or GIFs:</strong> Use {" "}
                        <code className="text-xs bg-gray-100 px-1 rounded">&lt;img src="URL" alt="description" /&gt;</code>
                        {" (e.g., "}
                        <code className="text-xs bg-gray-100 px-1 rounded">&lt;img src="https://example.com/image.gif" alt="Example" /&gt;</code>
                        {")."}
                      </>
                    )}
                    {textFormat === "markdown" && " You can use Markdown syntax for formatting (e.g., **bold**, *italic*, - lists, etc.). To add images: ![alt text](image-url)."}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Click-through demo (Labs) – visual step + hotspot editor */}
          {formData.content_type === "clickthrough_demo" && (
            <div className="space-y-2 border rounded-lg p-4 bg-amber-50/30 border-amber-200">
              <ClickthroughDemoEditor
                value={formData.content_data?.steps ? { steps: formData.content_data.steps } : { steps: [] }}
                onChange={(data) => setFormData({ ...formData, content_data: data })}
              />
            </div>
          )}

          {/* Content Data (JSON) - For quiz, download, link types */}
          {(formData.content_type === "quiz" || formData.content_type === "download" || formData.content_type === "link") && (
            <div>
              <Label className="text-[#060520]">Content Data (JSON)</Label>
              <Textarea
                value={JSON.stringify(formData.content_data, null, 2)}
                onChange={(e) => {
                  try {
                    setFormData({ ...formData, content_data: JSON.parse(e.target.value) })
                  } catch {
                    // Invalid JSON, keep as is
                  }
                }}
                rows={6}
                placeholder={
                  formData.content_type === "link"
                    ? '{"url": "https://example.com", "title": "Link Title", "description": "Link description"}'
                    : formData.content_type === "download"
                    ? '{"file_url": "https://example.com/file.pdf", "file_name": "Document.pdf", "file_size": 1024000}'
                    : formData.content_type === "quiz"
                    ? '{"quiz_id": "uuid-of-quiz"}'
                    : '{}'
                }
                className="text-[#060520] placeholder:text-gray-400 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.content_type === "link" && "Enter link URL, title, and description."}
                {formData.content_type === "download" && "Enter file URL, file name, and file size in bytes."}
                {formData.content_type === "quiz" && "Enter the quiz ID to link to a quiz."}
              </p>
            </div>
          )}

          {/* Advanced JSON Editor (collapsible) */}
          <details className="text-xs">
            <summary className="text-gray-500 cursor-pointer hover:text-gray-700">
              Advanced: Edit JSON directly
            </summary>
            <div className="mt-2">
              <Textarea
                value={JSON.stringify(formData.content_data, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value)
                    setFormData({ ...formData, content_data: parsed })
                    if (parsed.video?.url) {
                      setVideoUrl(parsed.video.url)
                      setHasVideo(true)
                    }
                    if (parsed.text?.content) {
                      setTextContent(parsed.text.content)
                      setTextFormat(parsed.text.format || "markdown")
                      setHasText(true)
                    }
                  } catch {
                    // Invalid JSON, keep as is
                  }
                }}
                rows={6}
                className="text-[#060520] placeholder:text-gray-400 font-mono text-sm"
              />
            </div>
          </details>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[#060520]">Sort Order</Label>
              <Input
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                type="number"
                className="text-[#060520] placeholder:text-gray-400"
              />
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label className="text-[#060520]">Active</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function QuizDialog({
  open,
  onOpenChange,
  quiz,
  courses,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  quiz: UniversityQuiz | null
  courses: UniversityCourse[]
  onSubmit: (data: Omit<UniversityQuiz, 'id' | 'created_at' | 'updated_at'>) => void
}) {
  const [formData, setFormData] = useState({
    lecture_id: "",
    course_id: "",
    title: "",
    description: "",
    passing_score: 70,
    time_limit_minutes: 0,
    questions: [] as any[],
    is_active: true,
  })

  useEffect(() => {
    if (quiz) {
      setFormData({
        lecture_id: quiz.lecture_id || "",
        course_id: quiz.course_id || "none",
        title: quiz.title,
        description: quiz.description || "",
        passing_score: quiz.passing_score,
        time_limit_minutes: quiz.time_limit_minutes || 0,
        questions: Array.isArray(quiz.questions) ? quiz.questions : [],
        is_active: quiz.is_active,
      })
    } else {
      setFormData({
        lecture_id: "",
        course_id: "none",
        title: "",
        description: "",
        passing_score: 70,
        time_limit_minutes: 0,
        questions: [],
        is_active: true,
      })
    }
  }, [quiz, open, courses])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.title || formData.title.trim() === "") {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive"
      })
      return
    }
    
    // Validate questions JSON
    let questions = formData.questions
    try {
      // Try to parse if it's a string (from textarea)
      if (typeof formData.questions === 'string') {
        const trimmed = formData.questions.trim()
        if (trimmed === "") {
          questions = []
        } else {
          questions = JSON.parse(trimmed)
        }
      }
      // Ensure it's an array
      if (!Array.isArray(questions)) {
        toast({
          title: "Error",
          description: "Questions must be a valid JSON array",
          variant: "destructive"
        })
        return
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Invalid JSON format for questions: ${error.message}. Please check your syntax.`,
        variant: "destructive"
      })
      return
    }
    
    // Convert "none" back to empty string for course_id, and handle empty lecture_id
    const submitData: any = {
      title: formData.title,
      description: formData.description || null,
      passing_score: formData.passing_score,
      time_limit_minutes: formData.time_limit_minutes || null,
      questions: questions,
      is_active: formData.is_active,
    }
    
    // Only include course_id and lecture_id if they have values
    if (formData.course_id && formData.course_id !== "none") {
      submitData.course_id = formData.course_id
    }
    if (formData.lecture_id && formData.lecture_id.trim() !== "") {
      submitData.lecture_id = formData.lecture_id
    }
    
    console.log("Submitting quiz data:", submitData)
    onSubmit(submitData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#060520]">{quiz ? "Edit Quiz" : "Create Quiz"}</DialogTitle>
          <DialogDescription className="text-gray-600">Manage quiz questions and settings</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[#060520]">Course (Optional)</Label>
              <Select 
                value={formData.course_id || undefined} 
                onValueChange={(value) => setFormData({ ...formData, course_id: value === "none" ? "" : value })}
              >
                <SelectTrigger className="text-[#060520] placeholder:text-gray-400">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent className="text-[#060520]">
                  <SelectItem value="none" className="text-[#060520]">None</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id} className="text-[#060520]">{course.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[#060520]">Lecture ID (Optional)</Label>
              <Input
                value={formData.lecture_id}
                onChange={(e) => setFormData({ ...formData, lecture_id: e.target.value })}
                placeholder="UUID of linked lecture"
                className="text-[#060520] placeholder:text-gray-400"
              />
            </div>
          </div>
          <div>
            <Label className="text-[#060520]">Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="text-[#060520] placeholder:text-gray-400"
            />
          </div>
          <div>
            <Label className="text-[#060520]">Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="text-[#060520] placeholder:text-gray-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[#060520]">Passing Score (%)</Label>
              <Input
                value={formData.passing_score}
                onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) || 0 })}
                type="number"
                min="0"
                max="100"
                className="text-[#060520] placeholder:text-gray-400"
              />
            </div>
            <div>
              <Label className="text-[#060520]">Time Limit (minutes, 0 = no limit)</Label>
              <Input
                value={formData.time_limit_minutes}
                onChange={(e) => setFormData({ ...formData, time_limit_minutes: parseInt(e.target.value) || 0 })}
                type="number"
                min="0"
                className="text-[#060520] placeholder:text-gray-400"
              />
            </div>
          </div>
          <div>
            <Label className="text-[#060520]">Questions (JSON Array)</Label>
            <Textarea
              value={typeof formData.questions === 'string' ? formData.questions : JSON.stringify(formData.questions, null, 2)}
              onChange={(e) => {
                // Store as string to allow editing invalid JSON
                setFormData({ ...formData, questions: e.target.value as any })
              }}
              rows={10}
              placeholder='[{"id": "q1", "type": "multiple_choice", "question": "What is...?", "options": ["A", "B", "C"], "correct_answer": 0, "points": 10}]'
              className="text-[#060520] placeholder:text-gray-400 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter questions as JSON array. Each question needs: id, type, question, correct_answer, points. 
              For multiple_choice: include options array. Example: {`[{"id": "q1", "type": "multiple_choice", "question": "What is...?", "options": ["A", "B", "C"], "correct_answer": 0, "points": 10}]`}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label className="text-[#060520]">Active</Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function OnboardingQuestionDialog({
  open,
  onOpenChange,
  question,
  schools,
  courses,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  question: UniversityOnboardingQuestion | null
  schools: UniversitySchool[]
  courses: UniversityCourse[]
  onSubmit: (data: Omit<UniversityOnboardingQuestion, "id" | "created_at" | "updated_at">) => void
}) {
  const defaultOptions: UniversityOnboardingQuestionOption[] = [
    { value: "yes", label: "Yes", recommended_school_ids: [], recommended_course_ids: [] },
    { value: "no", label: "No", recommended_school_ids: [], recommended_course_ids: [] },
  ]
  const [formData, setFormData] = useState({
    title: "",
    question_text: "",
    question_key: "",
    input_type: "yes_no" as "yes_no" | "multi_choice",
    options: defaultOptions,
    phase: 1 as 1 | 2 | 3,
    sort_order: 0,
    is_active: true,
  })

  useEffect(() => {
    if (question) {
      setFormData({
        title: question.title,
        question_text: question.question_text,
        question_key: question.question_key,
        input_type: question.input_type,
        options: (question.options && question.options.length)
          ? question.options.map((o) => ({ ...o, recommended_course_ids: o.recommended_course_ids ?? [] }))
          : defaultOptions,
        phase: question.phase as 1 | 2 | 3,
        sort_order: question.sort_order,
        is_active: question.is_active,
      })
    } else {
      setFormData({
        title: "",
        question_text: "",
        question_key: "",
        input_type: "yes_no",
        options: defaultOptions.map((o) => ({ ...o, recommended_school_ids: [], recommended_course_ids: [] })),
        phase: 1,
        sort_order: 0,
        is_active: true,
      })
    }
  }, [question, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const setOptionRecommendedSchools = (optionIndex: number, schoolIds: string[]) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) =>
        i === optionIndex ? { ...opt, recommended_school_ids: schoolIds } : opt
      ),
    }))
  }

  const setOptionRecommendedCourses = (optionIndex: number, courseIds: string[]) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) =>
        i === optionIndex ? { ...opt, recommended_course_ids: courseIds } : opt
      ),
    }))
  }

  const toggleOptionSchool = (optionIndex: number, schoolId: string) => {
    const opt = formData.options[optionIndex]
    const ids = opt.recommended_school_ids || []
    const next = ids.includes(schoolId) ? ids.filter((id) => id !== schoolId) : [...ids, schoolId]
    setOptionRecommendedSchools(optionIndex, next)
  }

  const toggleOptionCourse = (optionIndex: number, courseId: string) => {
    const opt = formData.options[optionIndex]
    const ids = opt.recommended_course_ids || []
    const next = ids.includes(courseId) ? ids.filter((id) => id !== courseId) : [...ids, courseId]
    setOptionRecommendedCourses(optionIndex, next)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#060520]">
            {question ? "Edit Onboarding Question" : "Create Onboarding Question"}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Shown when a client enters Hubflo Labs for the first time. For each answer you can recommend programs and/or specific courses.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-[#060520]">Title (admin label)</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="text-[#060520]"
            />
          </div>
          <div>
            <Label className="text-[#060520]">Question text (shown to client)</Label>
            <Textarea
              value={formData.question_text}
              onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
              required
              rows={2}
              className="text-[#060520]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[#060520]">Question key (unique slug)</Label>
              <Input
                value={formData.question_key}
                onChange={(e) => setFormData({ ...formData, question_key: e.target.value })}
                required
                placeholder="e.g. first_time_hubflo"
                className="text-[#060520]"
                disabled={!!question}
              />
              {question && <p className="text-xs text-gray-500 mt-1">Key cannot be changed when editing</p>}
            </div>
            <div>
              <Label className="text-[#060520]">Input type</Label>
              <Select
                value={formData.input_type}
                onValueChange={(v: "yes_no" | "multi_choice") => setFormData({ ...formData, input_type: v })}
              >
                <SelectTrigger className="text-[#060520]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes_no" className="text-[#060520]">Yes / No</SelectItem>
                  <SelectItem value="multi_choice" className="text-[#060520]">Multiple choice</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[#060520]">Phase</Label>
              <Select
                value={String(formData.phase)}
                onValueChange={(v) => setFormData({ ...formData, phase: Number(v) as 1 | 2 | 3 })}
              >
                <SelectTrigger className="text-[#060520]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1" className="text-[#060520]">1 – Workspace & Hubflo</SelectItem>
                  <SelectItem value="2" className="text-[#060520]">2 – Billing & integrations</SelectItem>
                  <SelectItem value="3" className="text-[#060520]">3 – Everything else</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[#060520]">Sort order</Label>
              <Input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                className="text-[#060520]"
              />
            </div>
          </div>
          <div>
            <Label className="text-[#060520]">Answer options → recommend programs & courses</Label>
            <p className="text-sm text-gray-500 mb-2">For each option, select which programs and/or specific courses to recommend when the client chooses that answer.</p>
            <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
              {formData.options.map((opt, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex gap-4 items-center">
                    <Input
                      value={opt.value}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          options: prev.options.map((o, i) => (i === idx ? { ...o, value: e.target.value } : o)),
                        }))
                      }
                      placeholder="Value"
                      className="w-24 text-[#060520]"
                    />
                    <Input
                      value={opt.label}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          options: prev.options.map((o, i) => (i === idx ? { ...o, label: e.target.value } : o)),
                        }))
                      }
                      placeholder="Label"
                      className="flex-1 text-[#060520]"
                    />
                  </div>
                  <div className="pl-2 space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Programs</p>
                      <div className="flex flex-wrap gap-2">
                        {schools.map((school) => (
                          <label key={school.id} className="flex items-center gap-1.5 text-sm cursor-pointer">
                            <Checkbox
                              checked={(opt.recommended_school_ids || []).includes(school.id)}
                              onCheckedChange={() => toggleOptionSchool(idx, school.id)}
                            />
                            <span className="text-[#060520]">{school.name}</span>
                          </label>
                        ))}
                        {schools.length === 0 && (
                          <p className="text-sm text-gray-500">No programs yet. Create schools first.</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Courses (specific course to open)</p>
                      <div className="flex flex-wrap gap-2">
                        {courses.map((course) => {
                          const school = schools.find((s) => s.id === course.school_id)
                          return (
                            <label key={course.id} className="flex items-center gap-1.5 text-sm cursor-pointer">
                              <Checkbox
                                checked={(opt.recommended_course_ids || []).includes(course.id)}
                                onCheckedChange={() => toggleOptionCourse(idx, course.id)}
                              />
                              <span className="text-[#060520]">
                                {course.title}
                                {school ? ` (${school.name})` : ""}
                              </span>
                            </label>
                          )
                        })}
                        {courses.length === 0 && (
                          <p className="text-sm text-gray-500">No courses yet. Create courses first.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label className="text-[#060520]">Active</Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
