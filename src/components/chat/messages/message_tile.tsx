/* eslint-disable @next/next/no-img-element */
import { Message } from 'ai'
import { NextPage } from 'next'
import Markdown from 'markdown-to-jsx'
import { cn, relativeTimeFromDates } from '@/lib/utils'
import CopyMessage from '@/components/misc/copy_message'
import ExportMessage from '@/components/misc/export_message'
import { useState } from 'react'
import { Like1, Dislike } from 'iconsax-react'
import { addMessage } from '@/app/[locale]/actions/chat_actions'

interface Props {
  message: Message
  isGenerating: boolean
  runId: string | null
  chatId: string | any
  append: (message: { content: string; role: 'user' | 'assistant' }) => void
  scrollToBottom: () => void
}

const MessageTile: NextPage<Props> = ({
  message: m,
  isGenerating,
  runId,
  chatId,
  append,
  scrollToBottom,
}) => {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)

  const sendFeedback = async (newFeedback: 'up' | 'down') => {
    const updatedFeedback = feedback === newFeedback ? null : newFeedback
    setFeedback(updatedFeedback)
    const feedbackString = updatedFeedback === null ? 'none' : updatedFeedback

    if (!runId) {
      console.log('runId is null, no feedback sent')
      return
    }

    await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        runId,
        feedback: feedbackString,
        feedback_key: 'chat',
      }),
    })
  }

  const handleQuestionClick = (question: string) => {
    // Remove any numbering (e.g., "1.", "2.", etc.)
    const cleanedQuestion = question.replace(/^\d+\.\s*/, '')
    addMessage(chatId, 'user', cleanedQuestion)
    append({
      content: cleanedQuestion,
      role: 'user',
    })
    scrollToBottom()
  }

  // Parse the content and look for useful questions block
  const renderContentWithQuestions = (content: string) => {
    const englishMatch = content.match(/QuestionsE:\s*\[([\s\S]*?)\]/)
    const greekMatch = content.match(/QuestionsG:\s*\[([\s\S]*?)\]/)

    const isEnglish = !!englishMatch
    const questions = (isEnglish ? englishMatch : greekMatch)?.[1]
      .split(',')
      .map((q) => q.trim().replace(/['"]/g, ''))
      .filter((q) => q.length > 0)

    const mainContent = content.replace(/Questions[EG]:\s*\[([\s\S]*?)\]/, '')

    return (
      <>
        <Markdown>{mainContent}</Markdown>
        {questions && questions.length > 0 && (
          <div className="mt-4">
            <b>
              {isEnglish
                ? 'Possible Useful Questions:'
                : 'Πιθανές Χρήσιμες Ερωτήσεις:'}
            </b>
            <ul className="list-none list-inside mt-2 space-y-2">
              {questions.map((question, index) => (
                <li
                  key={index}
                  className="cursor-pointer"
                  onClick={() => handleQuestionClick(question)}
                >
                  {question}
                </li>
              ))}
            </ul>
          </div>
        )}
      </>
    )
  }

  return (
    <div
      className={cn('whitespace-pre-wrap text-sm mb-6 py-2 px-4 rounded-3xl', {
        'self-end bg-slate-200  max-w-fit md:max-w-[40svw] rounded-br-none text-right':
          m.role === 'user',
        'border border-slate-200 max-w-fit rounded-bl-none py-6':
          m.role === 'assistant',
      })}
    >
      <div className="flex md:flex-row flex-col md:mb-0 mb-2 md:space-x-4 md:space-y-0 space-y-2">
        {m.role === 'assistant' && (
          <div className="min-h-8 min-w-8 max-w-8 max-h-8 rounded-full bg-gray-200">
            <img
              src="/miniLogo.png"
              className="object-fill"
              alt="logo"
            />
          </div>
        )}
        <div>{renderContentWithQuestions(m.content)}</div>
      </div>

      {m.role === 'assistant' && !isGenerating && (
        <div className="flex items-center space-x-2 justify-end mt-4">
          <p className="text-xs text-slate-500 pl-12">
            {relativeTimeFromDates(m.createdAt!)}
          </p>

          <div className="flex items-center">
            <ExportMessage content={m.content} />
            <CopyMessage content={m.content} />

            <div className="flex space-x-2 ml-2">
              <button onClick={() => sendFeedback('up')}>
                <Like1
                  size="16"
                  color={feedback === 'up' ? '#2563EB' : '#2e2d2d'}
                  variant={feedback === 'up' ? 'Bold' : 'Outline'}
                />
              </button>
              <button onClick={() => sendFeedback('down')}>
                <Dislike
                  size="16"
                  color={feedback === 'down' ? '#2563EB' : '#2e2d2d'}
                  variant={feedback === 'down' ? 'Bold' : 'Outline'}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MessageTile
