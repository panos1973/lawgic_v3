import { Message } from 'ai/react'
import { toast } from 'sonner'
import { unified } from 'unified'
import markdown from 'remark-parse'
import docx from 'remark-docx'
import { saveAs } from 'file-saver'

export const exportAllMessages = async (messages: Message[]) => {
  const cleanContent = (content: string): string => {
    const cleaned = content
      .replace(/<br\s*\/?>/gi, '\n') // Replace <br> and <br/> with a newline
      .replace(/<b>|<\/b>/gi, '**') // Convert <b> and </b> to Markdown bold syntax (**text**)
      .replace(/<strong>|<\/strong>/gi, '**') // Convert <strong> and </strong> to Markdown bold syntax (**text**)
      .replace(/<[^>]*>?/gm, '') // Remove any other HTML tags
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
    return cleaned
  }

  const allMessages = messages
    .filter((m) => m.content.trim() !== '')
    .map((m) => {
      const sender = m.role === 'user' ? 'Ερώτηση' : 'Απάντηση'
      const cleanedContent = cleanContent(m.content)

      return `**${sender}:**\n\n${cleanedContent}\n`
    })
    .join('\n\n')

  const processor = unified()
    .use(markdown)
    .use(docx, {
      output: 'blob',
      styles: {
        default: {
          document: {
            run: {
              font: 'Arial',
              size: 20,
            },
            paragraph: {
              spacing: {
                before: 120,
                after: 240,
              },
            },
          },
          heading1: {
            run: {
              font: 'Arial',
              bold: true,
              size: 28,
            },
            paragraph: {
              spacing: {
                before: 200,
                after: 200,
              },
            },
          },
        },
      },
    })

  const doc = await processor.process(allMessages)
  const blob = await doc.result
  saveAs(
    blob as Blob,
    `lawgic_chat_export_${new Date().toLocaleTimeString()}.docx`
  )
  toast.success('Chat Exported')
}
