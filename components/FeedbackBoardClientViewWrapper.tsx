"use client"

import { FeedbackBoardClientView } from "./FeedbackBoardClientView"

interface FeedbackBoardClientViewWrapperProps {
  clientId: string
}

export function FeedbackBoardClientViewWrapper({ clientId }: FeedbackBoardClientViewWrapperProps) {
  return <FeedbackBoardClientView clientId={clientId} />
} 