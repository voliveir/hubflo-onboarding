import type { UniversityClientProgress } from "@/lib/types"

const STORAGE_KEY = "hubflo-university-progress-v1"

type StoredEntry = {
  course_id: string
  lecture_id: string
  progress_percentage: number
  is_completed: boolean
  time_spent_minutes: number
}

type StoredShape = {
  v: 1
  byKey: Record<string, StoredEntry>
}

function storageKey(courseId: string, lectureId: string) {
  return `${courseId}\t${lectureId}`
}

function readRaw(): StoredShape {
  if (typeof window === "undefined") {
    return { v: 1, byKey: {} }
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { v: 1, byKey: {} }
    const parsed = JSON.parse(raw) as StoredShape
    if (parsed?.v === 1 && parsed.byKey && typeof parsed.byKey === "object") {
      return parsed
    }
  } catch {
    /* ignore */
  }
  return { v: 1, byKey: {} }
}

function writeRaw(data: StoredShape) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    /* quota / private mode */
  }
}

function entryToProgress(e: StoredEntry): UniversityClientProgress {
  const now = new Date().toISOString()
  return {
    id: `local-${e.course_id}-${e.lecture_id}`,
    client_id: "local",
    course_id: e.course_id,
    lecture_id: e.lecture_id,
    progress_percentage: e.progress_percentage,
    is_completed: e.is_completed,
    time_spent_minutes: e.time_spent_minutes,
    last_accessed_at: now,
    created_at: now,
    updated_at: now,
  }
}

/** All lecture progress rows stored locally (for overview / course list). */
export function readAllLocalUniversityProgress(): UniversityClientProgress[] {
  const { byKey } = readRaw()
  return Object.values(byKey).map(entryToProgress)
}

export function readLocalUniversityProgressForCourse(courseId: string): UniversityClientProgress[] {
  const { byKey } = readRaw()
  return Object.values(byKey)
    .filter((e) => e.course_id === courseId)
    .map(entryToProgress)
}

export function upsertLocalLectureProgress(
  courseId: string,
  lectureId: string,
  progress: {
    progress_percentage: number
    is_completed: boolean
    time_spent_minutes?: number
  }
) {
  const data = readRaw()
  const key = storageKey(courseId, lectureId)
  const prev = data.byKey[key]
  data.byKey[key] = {
    course_id: courseId,
    lecture_id: lectureId,
    progress_percentage: progress.progress_percentage,
    is_completed: progress.is_completed,
    time_spent_minutes: progress.time_spent_minutes ?? prev?.time_spent_minutes ?? 0,
  }
  writeRaw(data)
}

export function getLocalLectureProgress(
  courseId: string,
  lectureId: string
): Pick<UniversityClientProgress, "progress_percentage" | "is_completed" | "time_spent_minutes"> | null {
  const data = readRaw()
  const e = data.byKey[storageKey(courseId, lectureId)]
  if (!e) return null
  return {
    progress_percentage: e.progress_percentage,
    is_completed: e.is_completed,
    time_spent_minutes: e.time_spent_minutes,
  }
}
