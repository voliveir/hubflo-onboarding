import { NextRequest, NextResponse } from "next/server"
import { submitQuizAttempt, getUniversityQuiz } from "@/lib/database"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const quizId = searchParams.get("quizId")

    if (!quizId) {
      return NextResponse.json(
        { success: false, error: "Quiz ID is required" },
        { status: 400 }
      )
    }

    const quiz = await getUniversityQuiz(quizId)
    
    if (!quiz) {
      return NextResponse.json(
        { success: false, error: "Quiz not found" },
        { status: 404 }
      )
    }

    // Don't send correct answers to client
    const quizForClient = {
      ...quiz,
      questions: quiz.questions.map((q: any) => ({
        id: q.id,
        type: q.type,
        question: q.question,
        options: q.options,
        points: q.points,
        // Don't include correct_answer or explanation
      })),
    }

    return NextResponse.json({ success: true, data: quizForClient })
  } catch (error: any) {
    console.error("Error fetching quiz:", error)
    return NextResponse.json(
      { success: false, error: error?.message || "Unknown error" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { clientId, quizId, answers, timeTakenMinutes } = await req.json()

    if (!clientId || !quizId || !answers) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get quiz to calculate score
    const quiz = await getUniversityQuiz(quizId)
    if (!quiz) {
      return NextResponse.json(
        { success: false, error: "Quiz not found" },
        { status: 404 }
      )
    }

    // Calculate score
    let totalPoints = 0
    let earnedPoints = 0

    quiz.questions.forEach((question: any) => {
      totalPoints += question.points || 1
      const userAnswer = answers[question.id]
      
      if (userAnswer !== undefined) {
        if (question.type === "multiple_choice" || question.type === "true_false") {
          if (userAnswer === question.correct_answer) {
            earnedPoints += question.points || 1
          }
        } else if (question.type === "short_answer") {
          // For short answer, do case-insensitive comparison
          const userAnswerLower = String(userAnswer).toLowerCase().trim()
          const correctAnswerLower = String(question.correct_answer).toLowerCase().trim()
          if (userAnswerLower === correctAnswerLower) {
            earnedPoints += question.points || 1
          }
        }
      }
    })

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0

    const result = await submitQuizAttempt(
      clientId,
      quizId,
      answers,
      score,
      timeTakenMinutes
    )

    return NextResponse.json({ 
      success: true, 
      data: {
        ...result,
        totalPoints,
        earnedPoints,
        questions: quiz.questions.map((q: any) => ({
          id: q.id,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
        })),
      }
    })
  } catch (error: any) {
    console.error("Error submitting quiz:", error)
    return NextResponse.json(
      { success: false, error: error?.message || "Unknown error" },
      { status: 500 }
    )
  }
}
