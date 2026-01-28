"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Video,
  FileText,
  Download,
  ExternalLink,
  HelpCircle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Clock,
} from "lucide-react"
import type { UniversityLecture, UniversityQuiz } from "@/lib/types"
import { toast } from "@/hooks/use-toast"
import DOMPurify from "dompurify"

interface LectureViewerProps {
  lecture: UniversityLecture
  clientId: string
  courseId: string
  onBack: () => void
  onComplete: () => void
}

export function LectureViewer({ lecture, clientId, courseId, onBack, onComplete }: LectureViewerProps) {
  const [progress, setProgress] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [quiz, setQuiz] = useState<UniversityQuiz | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, any>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizResults, setQuizResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)

  useEffect(() => {
    // Start tracking time
    const startTime = Date.now()
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000 / 60)) // minutes
    }, 60000)

    // Load quiz if lecture is a quiz type
    if (lecture.content_type === "quiz" && lecture.content_data?.quiz_id) {
      loadQuiz(lecture.content_data.quiz_id)
    }

    // Load existing progress
    loadProgress()

    return () => clearInterval(interval)
  }, [lecture.id])

  const loadProgress = async () => {
    try {
      const response = await fetch(`/api/university/progress?clientId=${clientId}&lectureId=${lecture.id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          const lectureProgress = data.data.find((p: any) => p.lecture_id === lecture.id)
          if (lectureProgress) {
            setProgress(lectureProgress.progress_percentage || 0)
            setIsCompleted(lectureProgress.is_completed || false)
          }
        } else if (data.data && !Array.isArray(data.data)) {
          setProgress(data.data.progress_percentage || 0)
          setIsCompleted(data.data.is_completed || false)
        }
      }
    } catch (error) {
      console.error("Error loading progress:", error)
    }
  }

  const loadQuiz = async (quizId: string) => {
    try {
      const response = await fetch(`/api/university/quiz?quizId=${quizId}`)
      if (response.ok) {
        const data = await response.json()
        setQuiz(data.data)
      }
    } catch (error) {
      console.error("Error loading quiz:", error)
    }
  }

  const updateProgress = async (newProgress: number, completed: boolean = false) => {
    try {
      const response = await fetch("/api/university/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          lectureId: lecture.id,
          courseId,
          progress: {
            progress_percentage: newProgress,
            is_completed: completed,
            time_spent_minutes: timeSpent,
          },
        }),
      })

      if (response.ok) {
        setProgress(newProgress)
        setIsCompleted(completed)
        if (completed) {
          onComplete()
        }
      }
    } catch (error) {
      console.error("Error updating progress:", error)
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      })
    }
  }

  const handleMarkComplete = () => {
    updateProgress(100, true)
    toast({
      title: "Success",
      description: "Lecture marked as complete!",
    })
  }

  const handleQuizSubmit = async () => {
    if (!quiz) return

    setLoading(true)
    try {
      const response = await fetch("/api/university/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          quizId: quiz.id,
          answers: quizAnswers,
          timeTakenMinutes: timeSpent,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setQuizResults(data.data)
        setQuizSubmitted(true)
        
        // Update progress based on quiz score
        if (data.data.passed) {
          updateProgress(100, true)
          toast({
            title: "Congratulations!",
            description: `You passed the quiz with a score of ${data.data.score}%!`,
          })
        } else {
          updateProgress(50, false)
          toast({
            title: "Quiz Submitted",
            description: `Your score: ${data.data.score}%. Passing score: ${quiz.passing_score}%`,
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Error submitting quiz:", error)
      toast({
        title: "Error",
        description: "Failed to submit quiz",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const renderVideo = (videoData: any) => {
    if (!videoData || !videoData.url) return null

    // Handle different video providers
    if (videoData.provider === "youtube") {
      const videoId = videoData.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]
      return (
        <div className="aspect-video w-full mb-6">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="w-full h-full rounded-lg"
            allowFullScreen
            title={lecture.title}
          />
        </div>
      )
    } else if (videoData.provider === "vimeo") {
      const videoId = videoData.url.match(/vimeo\.com\/(\d+)/)?.[1]
      return (
        <div className="aspect-video w-full mb-6">
          <iframe
            src={`https://player.vimeo.com/video/${videoId}`}
            className="w-full h-full rounded-lg"
            allowFullScreen
            title={lecture.title}
          />
        </div>
      )
    } else if (videoData.provider === "tella") {
      const embedUrl = videoData.url.replace("/video/", "/video/").replace(/\/$/, "") + "/embed"
      return (
        <div className="aspect-video w-full mb-6">
          <iframe
            src={embedUrl}
            className="w-full h-full rounded-lg"
            allowFullScreen
            title={lecture.title}
          />
        </div>
      )
    } else {
      // Generic video URL
      return (
        <div className="aspect-video w-full bg-gray-100 rounded-lg flex items-center justify-center mb-6">
          <video controls className="w-full h-full rounded-lg">
            <source src={videoData.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )
    }
  }

  const renderText = (textData: any) => {
    if (!textData || !textData.content) return null

    const content = textData.content || ""
    
    // Check if content contains HTML tags
    const hasHtmlTags = /<[a-z][\s\S]*>/i.test(content)
    
    // If format is explicitly set to HTML, or if HTML tags are detected, render as HTML
    if (textData.format === "html" || hasHtmlTags) {
      // Sanitize HTML to prevent XSS attacks
      const sanitizedHtml = DOMPurify.sanitize(content, {
        ALLOWED_TAGS: [
          'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img', 'div', 'span',
          'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'sub', 'sup'
        ],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel'],
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
      })
      
      return (
        <div 
          className="prose max-w-none prose-headings:text-[#060520] prose-p:text-gray-700 prose-strong:text-[#060520] prose-a:text-brand-gold prose-a:no-underline hover:prose-a:underline prose-ul:list-disc prose-ol:list-decimal prose-li:my-1"
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }} 
        />
      )
    } else {
      // Plain text - preserve line breaks and whitespace
      return (
        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">{content}</div>
        </div>
      )
    }
  }

  const renderContent = () => {
    const contentData = lecture.content_data || {}
    
    // Check for new structure with both video and text
    const hasVideo = contentData.video?.url || (lecture.content_type === "video" && contentData.url)
    const hasText = contentData.text?.content || (lecture.content_type === "text" && contentData.content)
    
    // If both video and text are present, render both
    if (hasVideo && hasText) {
      const videoData = contentData.video || (lecture.content_type === "video" ? contentData : null)
      const textData = contentData.text || (lecture.content_type === "text" ? contentData : null)
      
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Video className="h-5 w-5 text-brand-gold" />
              Video Content
            </h3>
            {renderVideo(videoData)}
          </div>
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand-gold" />
              Text Content
            </h3>
            <p className="text-sm text-gray-600 mb-4">For clients who prefer reading over watching the video:</p>
            {renderText(textData)}
          </div>
        </div>
      )
    }
    
    // Legacy single content type rendering
    switch (lecture.content_type) {
      case "video":
        const videoData = contentData.video || contentData
        if (videoData.url) {
          return renderVideo(videoData)
        }
        return <p className="text-gray-500">Video URL not configured</p>

      case "text":
        const textData = contentData.text || contentData
        return renderText(textData)

      case "link":
        const linkData = lecture.content_data || {}
        return (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">{linkData.title || "External Link"}</h3>
                  {linkData.description && <p className="text-gray-600 mb-4">{linkData.description}</p>}
                </div>
                <Button asChild>
                  <a href={linkData.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Link
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      case "download":
        const downloadData = lecture.content_data || {}
        return (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">{downloadData.file_name || "Download File"}</h3>
                  {downloadData.file_size && (
                    <p className="text-sm text-gray-500">
                      Size: {(downloadData.file_size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>
                <Button asChild>
                  <a href={downloadData.file_url} download>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      case "quiz":
        if (!quiz) {
          return <p className="text-gray-500">Loading quiz...</p>
        }

        if (quizSubmitted && quizResults) {
          return (
            <div className="space-y-6">
              <Card className="border-2" style={{ borderColor: quizResults.passed ? '#10b981' : '#ef4444' }}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Quiz Results</CardTitle>
                    {quizResults.passed ? (
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    ) : (
                      <XCircle className="h-8 w-8 text-red-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold" style={{ color: quizResults.passed ? '#10b981' : '#ef4444' }}>
                      Score: {quizResults.score}%
                    </p>
                    <p className="text-sm text-gray-600">
                      {quizResults.earnedPoints} out of {quizResults.totalPoints} points
                    </p>
                    <p className="text-sm">
                      {quizResults.passed ? "Congratulations! You passed!" : `You need ${quiz.passing_score}% to pass.`}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {quiz.questions.map((question: any, index: number) => {
                      const userAnswer = quizAnswers[question.id]
                      const correctAnswer = quizResults.questions.find((q: any) => q.id === question.id)?.correct_answer
                      const isCorrect = userAnswer === correctAnswer

                      return (
                        <Card key={question.id} className={isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                          <CardContent className="pt-6">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <p className="font-medium">Question {index + 1}: {question.question}</p>
                                {isCorrect ? (
                                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                                )}
                              </div>
                              {question.options && (
                                <div className="space-y-2">
                                  {question.options.map((option: string, optIndex: number) => (
                                    <div
                                      key={optIndex}
                                      className={`p-2 rounded ${
                                        optIndex === correctAnswer
                                          ? "bg-green-100 border border-green-300"
                                          : optIndex === userAnswer && !isCorrect
                                          ? "bg-red-100 border border-red-300"
                                          : "bg-gray-50"
                                      }`}
                                    >
                                      {option}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {question.explanation && (
                                <p className="text-sm text-gray-600 mt-2">
                                  <strong>Explanation:</strong> {question.explanation}
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        }

        return (
          <div className="space-y-6">
            {quiz.time_limit_minutes && (
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <p className="text-sm">
                      Time limit: {quiz.time_limit_minutes} minutes
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-6">
              {quiz.questions.map((question: any, index: number) => (
                <Card key={question.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <Label className="text-base font-semibold">
                        Question {index + 1}: {question.question}
                        <span className="text-sm text-gray-500 ml-2">({question.points} points)</span>
                      </Label>

                      {question.type === "multiple_choice" && question.options && (
                        <RadioGroup
                          value={String(quizAnswers[question.id] ?? "")}
                          onValueChange={(value) =>
                            setQuizAnswers({ ...quizAnswers, [question.id]: parseInt(value) })
                          }
                        >
                          {question.options.map((option: string, optIndex: number) => (
                            <div key={optIndex} className="flex items-center space-x-2">
                              <RadioGroupItem value={String(optIndex)} id={`${question.id}-${optIndex}`} />
                              <Label htmlFor={`${question.id}-${optIndex}`} className="cursor-pointer">
                                {option}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      )}

                      {question.type === "true_false" && (
                        <RadioGroup
                          value={String(quizAnswers[question.id] ?? "")}
                          onValueChange={(value) =>
                            setQuizAnswers({ ...quizAnswers, [question.id]: value === "true" })
                          }
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id={`${question.id}-true`} />
                            <Label htmlFor={`${question.id}-true`} className="cursor-pointer">
                              True
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id={`${question.id}-false`} />
                            <Label htmlFor={`${question.id}-false`} className="cursor-pointer">
                              False
                            </Label>
                          </div>
                        </RadioGroup>
                      )}

                      {question.type === "short_answer" && (
                        <Textarea
                          value={quizAnswers[question.id] || ""}
                          onChange={(e) =>
                            setQuizAnswers({ ...quizAnswers, [question.id]: e.target.value })
                          }
                          placeholder="Enter your answer..."
                          rows={3}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleQuizSubmit}
                disabled={loading || Object.keys(quizAnswers).length < quiz.questions.length}
                className="bg-brand-gold hover:bg-brand-gold-hover text-[#010124]"
              >
                {loading ? "Submitting..." : "Submit Quiz"}
              </Button>
            </div>
          </div>
        )

      default:
        return <p className="text-gray-500">Content type not supported</p>
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Button 
          variant="outline" 
          onClick={onBack} 
          className="mb-6 border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-[#010124] font-semibold"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {(() => {
                    const contentData = lecture.content_data || {}
                    const hasVideo = contentData.video?.url || (lecture.content_type === "video" && contentData.url)
                    const hasText = contentData.text?.content || (lecture.content_type === "text" && contentData.content)
                    
                    if (hasVideo && hasText) {
                      return (
                        <>
                          <Video className="h-5 w-5 text-brand-gold" />
                          <FileText className="h-5 w-5 text-brand-gold" />
                        </>
                      )
                    } else if (lecture.content_type === "video") {
                      return <Video className="h-5 w-5 text-brand-gold" />
                    } else if (lecture.content_type === "text") {
                      return <FileText className="h-5 w-5 text-brand-gold" />
                    } else if (lecture.content_type === "quiz") {
                      return <HelpCircle className="h-5 w-5 text-brand-gold" />
                    } else if (lecture.content_type === "download") {
                      return <Download className="h-5 w-5 text-brand-gold" />
                    } else if (lecture.content_type === "link") {
                      return <ExternalLink className="h-5 w-5 text-brand-gold" />
                    }
                    return null
                  })()}
                  <CardTitle style={{ color: '#060520' }}>{lecture.title}</CardTitle>
                </div>
                {lecture.description && (
                  <p className="text-gray-600">{lecture.description}</p>
                )}
              </div>
              {isCompleted && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {progress > 0 && progress < 100 && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {renderContent()}

            {lecture.content_type !== "quiz" && !isCompleted && (
              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={handleMarkComplete}
                  className="bg-brand-gold hover:bg-brand-gold-hover text-[#010124]"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Complete
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
