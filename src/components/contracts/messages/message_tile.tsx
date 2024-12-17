/* eslint-disable @next/next/no-img-element */
import { Message } from 'ai'
import { NextPage } from 'next'
import Markdown from 'markdown-to-jsx'
import { cn, relativeTimeFromDates } from '@/lib/utils'
import CopyMessage from '@/components/misc/copy_message'
import ExportMessage from '@/components/misc/export_message'
import { useState } from 'react'
import { Like1, Dislike } from 'iconsax-react'

interface Props {
  message: Message
  isGenerating: boolean
  runId: string | null
}

const MessageTile: NextPage<Props> = ({ message: m, isGenerating, runId }) => {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)

  const sendFeedback = async (newFeedback: 'up' | 'down') => {
    // Toggle feedback
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
        <Markdown>{m.content}</Markdown>
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

// /* eslint-disable @next/next/no-img-element */
// import { Message } from 'ai'
// import { NextPage } from 'next'
// import Markdown from 'markdown-to-jsx'
// import { cn, relativeTimeFromDates } from '@/lib/utils'
// import CopyMessage from '@/components/misc/copy_message'
// import ExportMessage from '@/components/misc/export_message'

// interface Props {
//   message: Message
//   isGenerating: boolean
// }

// const MessageTile: NextPage<Props> = ({ message: m, isGenerating }) => {
//   return (
//     <div
//       className={cn('whitespace-pre-wrap text-sm px-2 rounded-3xl ', {
//         'self-end bg-slate-200 p-2 pt-4 pl-4 max-w-[60svw] md:max-w-[40svw] rounded-br-none text-right':
//           m.role === 'user',
//         ' max-w-fit rounded-bl-none py-6 ': m.role === 'assistant',
//       })}
//     >
//       <div className="flex space-x-4 text-xs">
//         {/* {m.role === "assistant" && (
//           <div className="min-h-8 min-w-8 max-w-8 max-h-8 rounded-full bg-gray-200">
//             <img src="/miniLogo.png" className="object-fill" alt="logo" />
//           </div>
//         )} */}
//         <Markdown>{m.content}</Markdown>
//       </div>

//       {m.role === 'assistant' && !isGenerating && (
//         <div className="flex items-center space-x-2 justify-end mt-4">
//           <p className="text-xs text-slate-500 pl-12">
//             {relativeTimeFromDates(m.createdAt!)}
//           </p>

//           <div className="flex">
//             <ExportMessage content={m.content} />
//             <CopyMessage content={m.content} />
//           </div>
//         </div>
//       )}

//       {/* {m.role === 'user' && !isGenerating && (
//         <div className="flex items-center space-x-2 justify-end mt-2">
//           <p className="text-xs text-slate-500 pl-12">
//             {relativeTimeFromDates(m.createdAt!)}
//           </p>

//           <div className="flex">
//             <ExportMessage content={m.content} />
//             <CopyMessage content={m.content} />
//           </div>
//         </div>
//       )} */}
//     </div>
//   )
// }

// export default MessageTile
