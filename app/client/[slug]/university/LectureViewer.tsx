"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
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
  BookOpen,
  MousePointerClick,
} from "lucide-react"
import type { UniversityLecture, UniversityQuiz } from "@/lib/types"
import { toast } from "@/hooks/use-toast"
import DOMPurify from "dompurify"
import { ClickthroughDemo } from "@/components/ClickthroughDemo"

interface LectureViewerProps {
  lecture: UniversityLecture
  clientId: string
  courseId: string
  onBack: () => void
  onComplete: () => void
  /** When true, render only the lecture content (no full-page chrome) for sidebar layout */
  embeddedLayout?: boolean
  /** Optional ref so parent can trigger "mark complete" (e.g. from header "Complete and continue") */
  markCompleteRef?: React.MutableRefObject<(() => void) | null>
}

export function LectureViewer({ lecture, clientId, courseId, onBack, onComplete, embeddedLayout = false, markCompleteRef }: LectureViewerProps) {
  const [progress, setProgress] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [quiz, setQuiz] = useState<UniversityQuiz | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, any>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizResults, setQuizResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)

  // Normalize so "clickthrough demo" / variants from DB or API are supported
  const contentType = (lecture.content_type ?? "").toString().replace(/\s+/g, "_").toLowerCase() || lecture.content_type

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
  }, [lecture.id, clientId, courseId])

  const loadProgress = async () => {
    try {
      const response = await fetch(`/api/university/progress?clientId=${clientId}&courseId=${courseId}`)
      if (response.ok) {
        const data = await response.json()
        const list = Array.isArray(data.data) ? data.data : []
        const lectureProgress = list.find((p: any) => p.lecture_id === lecture.id)
        if (lectureProgress) {
          setProgress(lectureProgress.progress_percentage || 0)
          setIsCompleted(lectureProgress.is_completed === true)
        } else {
          setProgress(0)
          setIsCompleted(false)
        }
      } else {
        setProgress(0)
        setIsCompleted(false)
      }
    } catch (error) {
      console.error("Error loading progress:", error)
      setProgress(0)
      setIsCompleted(false)
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

  const handleMarkCompleteRef = useRef(handleMarkComplete)
  handleMarkCompleteRef.current = handleMarkComplete

  useEffect(() => {
    if (!markCompleteRef) return
    const stableInvoke = () => handleMarkCompleteRef.current?.()
    markCompleteRef.current = stableInvoke
    return () => {
      markCompleteRef.current = null
    }
  }, [markCompleteRef])

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
        <div className="aspect-video w-full mb-6 rounded-2xl overflow-hidden border border-gray-200 shadow-md ring-1 ring-black/5">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="w-full h-full"
            allowFullScreen
            title={lecture.title}
          />
        </div>
      )
    } else if (videoData.provider === "vimeo") {
      const videoId = videoData.url.match(/vimeo\.com\/(\d+)/)?.[1]
      return (
        <div className="aspect-video w-full mb-6 rounded-2xl overflow-hidden border border-gray-200 shadow-md ring-1 ring-black/5">
          <iframe
            src={`https://player.vimeo.com/video/${videoId}`}
            className="w-full h-full"
            allowFullScreen
            title={lecture.title}
          />
        </div>
      )
    } else if (videoData.provider === "tella") {
      const embedUrl = videoData.url.replace("/video/", "/video/").replace(/\/$/, "") + "/embed"
      return (
        <div className="aspect-video w-full mb-6 rounded-2xl overflow-hidden border border-gray-200 shadow-md ring-1 ring-black/5">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allowFullScreen
            title={lecture.title}
          />
        </div>
      )
    } else {
      // Generic video URL
      return (
        <div className="aspect-video w-full bg-gray-100 rounded-2xl flex items-center justify-center mb-6 border border-gray-200 shadow-sm overflow-hidden">
          <video controls className="w-full h-full">
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
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel', 'width', 'height', 'style'],
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
      })
      
      return (
        <>
          <style dangerouslySetInnerHTML={{__html: `
            .lecture-content img {
              border-radius: 12px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              margin: 1.5rem auto;
              max-width: 100%;
              height: auto;
              display: block;
            }
            .lecture-content img:hover {
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
              transition: box-shadow 0.2s ease-in-out;
            }
            /* Section headings – gold accent like homepage */
            .lecture-content h1, .lecture-content h2, .lecture-content h3 {
              color: #060520 !important;
              font-weight: 700;
              margin-top: 1.75rem;
              margin-bottom: 0.5rem;
              padding-left: 0.75rem;
              border-left: 4px solid #ecb22d;
              line-height: 1.3;
            }
            .lecture-content h1 { font-size: 1.5rem; }
            .lecture-content h2 { font-size: 1.25rem; }
            .lecture-content h3 { font-size: 1.125rem; }
            /* Section titles (e.g. "Client Onboarding") – gold pill style */
            .lecture-content p + strong,
            .lecture-content ul + strong,
            .lecture-content p > strong:first-child:last-child {
              display: inline-block;
              color: #060520 !important;
              font-weight: 700;
              margin-top: 1.25rem;
              margin-bottom: 0.35rem;
              padding: 0.25rem 0.75rem;
              background: rgba(236, 178, 45, 0.12);
              border-radius: 9999px;
              font-size: 0.9375rem;
              border: 1px solid rgba(236, 178, 45, 0.25);
            }
            .lecture-content strong {
              color: #060520 !important;
            }
            /* Lists – no bullets; clean indent and subtle accent */
            .lecture-content ul {
              list-style: none;
              padding-left: 0;
              margin: 0.75rem 0 1.25rem 0;
            }
            .lecture-content ul li {
              position: relative;
              padding-left: 1rem;
              margin-bottom: 0.625rem;
              margin-left: 0.25rem;
              color: #374151;
              line-height: 1.6;
              border-left: 2px solid rgba(236, 178, 45, 0.2);
            }
            .lecture-content ul li:last-child {
              margin-bottom: 0;
            }
            .lecture-content ol {
              padding-left: 1.5rem;
              margin: 0.5rem 0 1.25rem 0;
            }
            .lecture-content ol li {
              margin-bottom: 0.5rem;
              padding-left: 0.25rem;
              color: #374151;
              line-height: 1.5;
            }
            .lecture-content ol li::marker {
              color: #ecb22d;
              font-weight: 600;
            }
            /* Intro paragraph */
            .lecture-content > p:first-child {
              font-size: 1rem;
              line-height: 1.6;
              color: #4b5563;
              margin-bottom: 1rem;
            }
            .lecture-content p {
              color: #4b5563;
              line-height: 1.6;
              margin-bottom: 0.75rem;
            }
            .lecture-content a {
              color: #ecb22d !important;
              text-decoration: none;
              font-weight: 500;
            }
            .lecture-content a:hover {
              text-decoration: underline;
            }
            /* Tables – clear structure, minimal clutter */
            .lecture-content table {
              width: 100%;
              border-collapse: collapse;
              margin: 1.25rem 0;
              font-size: 0.9375rem;
            }
            .lecture-content thead th {
              text-align: left;
              font-weight: 600;
              color: #060520;
              background: rgba(236, 178, 45, 0.1);
              padding: 0.75rem 1rem;
              border-bottom: 2px solid rgba(236, 178, 45, 0.35);
            }
            .lecture-content thead th:first-child {
              border-radius: 8px 0 0 0;
            }
            .lecture-content thead th:last-child {
              border-radius: 0 8px 0 0;
            }
            .lecture-content table tr:first-child th {
              text-align: left;
              font-weight: 600;
              color: #060520;
              background: rgba(236, 178, 45, 0.1);
              padding: 0.75rem 1rem;
              border-bottom: 2px solid rgba(236, 178, 45, 0.35);
            }
            .lecture-content tbody tr {
              border-bottom: 1px solid rgba(0, 0, 0, 0.06);
            }
            .lecture-content tbody tr:last-child {
              border-bottom: none;
            }
            .lecture-content tbody tr:nth-child(even) {
              background: rgba(0, 0, 0, 0.02);
            }
            .lecture-content tbody td {
              padding: 0.875rem 1rem;
              vertical-align: top;
              color: #374151;
              line-height: 1.5;
            }
            .lecture-content tbody td:first-child {
              font-weight: 500;
              color: #060520;
              min-width: 10rem;
            }
          `}} />
          <div 
            className="lecture-content prose max-w-none prose-headings:text-[#060520] prose-p:text-gray-700 prose-strong:text-[#060520] prose-a:text-brand-gold prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }} 
          />
        </>
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
    const hasVideo = contentData.video?.url || (contentType === "video" && contentData.url)
    const hasText = contentData.text?.content || (contentType === "text" && contentData.content)
    
    // If both video and text are present, render both
    if (hasVideo && hasText) {
      const videoData = contentData.video || (contentType === "video" ? contentData : null)
      const textData = contentData.text || (contentType === "text" ? contentData : null)
      
      return (
        <div className="space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-3 py-1.5 mb-4">
              <Video className="h-4 w-4 text-brand-gold" />
              <span className="text-brand-gold font-medium text-sm">Video Content</span>
            </div>
            {renderVideo(videoData)}
          </div>
          <div className="border-t border-gray-100 pt-8">
            <div className="inline-flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-3 py-1.5 mb-4">
              <FileText className="h-4 w-4 text-brand-gold" />
              <span className="text-brand-gold font-medium text-sm">Text Content</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">For clients who prefer reading over watching the video:</p>
            {renderText(textData)}
          </div>
        </div>
      )
    }
    
    // Legacy single content type rendering
    switch (contentType) {
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
          <Card className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-brand-gold/30">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 text-[#060520]">{linkData.title || "External Link"}</h3>
                  {linkData.description && <p className="text-gray-600 mb-4">{linkData.description}</p>}
                </div>
                <Button asChild className="rounded-2xl bg-brand-gold hover:bg-brand-gold-hover text-[#010124] font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
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
          <Card className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-brand-gold/30">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 text-[#060520]">{downloadData.file_name || "Download File"}</h3>
                  {downloadData.file_size && (
                    <p className="text-sm text-gray-500">
                      Size: {(downloadData.file_size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>
                <Button asChild className="rounded-2xl bg-brand-gold hover:bg-brand-gold-hover text-[#010124] font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                  <a href={downloadData.file_url} download>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      case "clickthrough_demo":
        return (
          <ClickthroughDemo
            contentData={contentData as { steps: Array<{ id: string; image_url: string; title?: string; description?: string; hotspots: Array<{ x: number; y: number; width: number; height: number; target_step_id: string; hint?: string }> }> }}
            onComplete={() => {
              updateProgress(100, true)
              onComplete()
            }}
          />
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
                className="rounded-2xl bg-brand-gold hover:bg-brand-gold-hover text-[#010124] font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 px-6 py-3"
              >
                {loading ? "Submitting..." : "Submit Quiz"}
              </Button>
            </div>
          </div>
        )

      default:
        // Fallback: if content has steps array, treat as clickthrough_demo (e.g. DB constraint not yet migrated)
        if (contentData?.steps && Array.isArray(contentData.steps)) {
          return (
            <ClickthroughDemo
              contentData={contentData as { steps: Array<{ id: string; image_url: string; title?: string; description?: string; hotspots: Array<{ x: number; y: number; width: number; height: number; target_step_id: string; hint?: string }> }> }}
              onComplete={() => {
                updateProgress(100, true)
                onComplete()
              }}
            />
          )
        }
        return <p className="text-gray-500">Content type not supported</p>
    }
  }

  const contentCard = (
    <motion.div
      initial={embeddedLayout ? undefined : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: embeddedLayout ? 0 : 0.1 }}
    >
      <Card className="rounded-2xl border border-gray-200 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-brand-gold/20 bg-white">
            <CardHeader className="pt-6 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Gold pill badge (homepage-style) */}
                  <div className="inline-flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-4 py-2 mb-4">
                    <BookOpen className="h-4 w-4 text-brand-gold" />
                    <span className="text-brand-gold font-medium text-sm">Lecture</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {(() => {
                      const contentData = lecture.content_data || {}
                      const hasVideo = contentData.video?.url || (contentType === "video" && contentData.url)
                      const hasText = contentData.text?.content || (contentType === "text" && contentData.content)
                      if (hasVideo && hasText) {
                        return (
                          <>
                            <Video className="h-5 w-5 text-brand-gold flex-shrink-0" />
                            <FileText className="h-5 w-5 text-brand-gold flex-shrink-0" />
                          </>
                        )
                      }
                      if (contentType === "video") return <Video className="h-5 w-5 text-brand-gold flex-shrink-0" />
                      if (contentType === "text") return <FileText className="h-5 w-5 text-brand-gold flex-shrink-0" />
                      if (contentType === "quiz") return <HelpCircle className="h-5 w-5 text-brand-gold flex-shrink-0" />
                      if (contentType === "download") return <Download className="h-5 w-5 text-brand-gold flex-shrink-0" />
                      if (contentType === "link") return <ExternalLink className="h-5 w-5 text-brand-gold flex-shrink-0" />
                      if (contentType === "clickthrough_demo") return <MousePointerClick className="h-5 w-5 text-brand-gold flex-shrink-0" />
                      return null
                    })()}
                    <CardTitle className="text-2xl font-bold" style={{ color: "#060520" }}>
                      {lecture.title}
                    </CardTitle>
                  </div>
                  {lecture.description && (
                    <p className="text-gray-600 leading-relaxed">{lecture.description}</p>
                  )}
                </div>
                {isCompleted && (
                  <Badge className="bg-green-100 text-green-800 border-green-200 flex-shrink-0">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-0">
              {progress > 0 && progress < 100 && (
                <div>
                  <div className="flex justify-between text-sm mb-2 text-gray-600">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {renderContent()}

              {contentType !== "quiz" && contentType !== "clickthrough_demo" && !isCompleted && (
                <div id="lecture-mark-complete" className="flex justify-end pt-6 border-t border-gray-100">
                  <Button
                    onClick={handleMarkComplete}
                    className="rounded-2xl bg-brand-gold hover:bg-brand-gold-hover text-[#010124] font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 px-6 py-3"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Complete
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
    </motion.div>
  )

  if (embeddedLayout) {
    return (
      <div className="min-h-full bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {contentCard}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "#060520" }}>
      {/* Sticky "Back to Course" bar – sits just below header */}
      <div className="sticky top-16 z-20 w-full border-b border-brand-gold/30 bg-[#060520]/95 backdrop-blur-sm -mt-2">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center gap-3">
          <Button
            onClick={onBack}
            className="rounded-2xl bg-brand-gold hover:bg-brand-gold-hover text-[#010124] font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 px-6 py-3 text-base flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Course
          </Button>
          <span className="text-sm text-white/70">
            Use this button to return to the course — the browser back button may leave University.
          </span>
        </div>
      </div>

      {/* Background gradient orbs (homepage-style) */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-brand-gold/3 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute inset-0 gradient-portal opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-8 sm:pt-12 sm:pb-10 space-y-6">
        {contentCard}
      </div>
    </div>
  )
}
