import { NextRequest, NextResponse } from "next/server"
import { submitQuizAttempt, getUniversityQuiz } from "@/lib/database"

function gradeQuizAnswers(
  quiz: NonNullable<Awaited<ReturnType<typeof getUniversityQuiz>>>,
  answers: Record<string, unknown>
) {
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
        const userAnswerLower = String(userAnswer).toLowerCase().trim()
        const correctAnswerLower = String(question.correct_answer).toLowerCase().trim()
        if (userAnswerLower === correctAnswerLower) {
          earnedPoints += question.points || 1
        }
      }
    }
  })

  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
  const passed = score >= quiz.passing_score

  return {
    score,
    passed,
    totalPoints,
    earnedPoints,
    questions: quiz.questions.map((q: any) => ({
      id: q.id,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
    })),
  }
}

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
    const body = await req.json()
    const { clientId, quizId, answers, timeTakenMinutes, gradeOnly } = body as {
      clientId?: string
      quizId?: string
      answers?: Record<string, unknown>
      timeTakenMinutes?: number
      gradeOnly?: boolean
    }

    if (!quizId || !answers) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
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

    const graded = gradeQuizAnswers(quiz, answers)

    if (gradeOnly === true) {
      return NextResponse.json({
        success: true,
        data: {
          id: "local",
          client_id: "local",
          quiz_id: quizId,
          answers,
          time_taken_minutes: timeTakenMinutes,
          ...graded,
        },
      })
    }

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    const result = await submitQuizAttempt(
      clientId,
      quizId,
      answers,
      graded.score,
      timeTakenMinutes
    )

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        totalPoints: graded.totalPoints,
        earnedPoints: graded.earnedPoints,
        questions: graded.questions,
      },
    })
  } catch (error: any) {
    console.error("Error submitting quiz:", error)
    return NextResponse.json(
      { success: false, error: error?.message || "Unknown error" },
      { status: 500 }
    )
  }
}
