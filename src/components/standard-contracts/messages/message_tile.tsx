/* eslint-disable @next/next/no-img-element */
import { Message } from 'ai'
import { NextPage } from 'next'
import { useState } from 'react'
import { Like1, Dislike } from 'iconsax-react'
import { cn, relativeTimeFromDates } from '@/lib/utils'
import CopyMessage from '@/components/misc/copy_message'
import ExportMessage from '@/components/misc/export_message'
import { toast } from 'sonner'
import Markdown from 'markdown-to-jsx'

interface Props {
  message: Message
  isGenerating: boolean
  runId: string | null
  contractId: string
  contractFiles: any[]
  fields: any[]
  messages: Message[]
}

const handleDownloadClick = async (
  contractId: string,
  contractFiles: any[],
  fields: any[],
  messages: Message[]
) => {
  try {
    const latestAssistantMessage =
      messages.filter((m) => m.role === 'assistant').pop()?.content || ''

    console.log('Latest Assistant Response:', latestAssistantMessage)

    const requestBody = {
      contractId,
      base64FileContent: contractFiles?.[0]?.file_content || '',
      fields,
      aiResponseText: latestAssistantMessage,
    }

    console.log('Request Body:', requestBody)

    const response = await fetch('/api/standard-contracts/file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error('Failed to update contract')
    }

    const data = await response.json()
    console.log('API Response:', data)

    const downloadLink = data.downloadLink
    if (downloadLink) {
      window.location.href = downloadLink
      toast.success('Download Started')
    } else {
      toast.error('Failed to generate download link')
    }
  } catch (error) {
    console.error('Error updating contract:', error)
    toast.error('Failed to update contract')
  }
}

const renderContentWithDownloadLinks = (
  content: string,
  contractId: string,
  contractFiles: any[],
  fields: any[],
  messages: Message[]
) => {
  const downloadTextEnglish = '\nDownload updated contract'
  const downloadTextGreek = '\nΚατεβάστε ενημερωμένο συμβόλαιο'

  // Check if either English or Greek pattern exists
  const englishPattern = new RegExp(downloadTextEnglish)
  const greekPattern = new RegExp(downloadTextGreek)

  if (englishPattern.test(content) || greekPattern.test(content)) {
    const isEnglish = englishPattern.test(content)
    const patternToSplit = isEnglish ? downloadTextEnglish : downloadTextGreek

    // Split the content once
    const parts = content.split(patternToSplit)

    return (
      <>
        <Markdown>{parts[0]}</Markdown>
        <span
          className="cursor-pointer pt-4 mt-4 "
          onClick={() =>
            handleDownloadClick(contractId, contractFiles, fields, messages)
          }
        >
          {isEnglish ? downloadTextEnglish : downloadTextGreek}
        </span>
        {parts[1] && <Markdown className="mt-4">{parts[1]}</Markdown>}
      </>
    )
  }

  return <Markdown>{content}</Markdown>
}

const MessageTile: NextPage<Props> = ({
  message: m,
  isGenerating,
  runId,
  contractId,
  contractFiles,
  fields,
  messages,
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

  return (
    <div
      className={cn('whitespace-pre-wrap text-sm mb-6 py-2 px-4 rounded-3xl', {
        'self-end bg-slate-200  max-w-fit md:max-w-[40svw] rounded-br-none text-right':
          m.role === 'user',
        'border border-slate-200 max-w-fit rounded-bl-none py-6':
          m.role === 'assistant',
      })}
    >
      <div className="flex space-x-4">
        {m.role === 'assistant' && (
          <div className="min-h-8 min-w-8 max-w-8 max-h-8 rounded-full bg-gray-200">
            <img
              src="/miniLogo.png"
              className="object-fill"
              alt="logo"
            />
          </div>
        )}

        <div>
          {renderContentWithDownloadLinks(
            m.content,
            contractId,
            contractFiles,
            fields,
            messages
          )}
        </div>
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
