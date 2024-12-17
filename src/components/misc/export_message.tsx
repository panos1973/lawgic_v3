import { NextPage } from 'next'
import { unified } from 'unified'
import markdown from 'remark-parse'
import docx from 'remark-docx'
import { saveAs } from 'file-saver'
import { DocumentDownload } from 'iconsax-react'
import { toast } from 'sonner'

interface Props {
  content: string
}

const ExportMessage: NextPage<Props> = ({ content }) => {
  const cleanContent = (content: string): string => {
    const cleaned = content
      .replace(/<br\s*\/?>/gi, '\n') // Replace <br> and <br/> with a newline
      .replace(/<b>|<\/b>/gi, '**') // Convert <b> and </b> to Markdown bold syntax (**text**)
      .replace(/<strong>|<\/strong>/gi, '**') // Convert <strong> and </strong> to Markdown bold syntax (**text**)
      .replace(/<[^>]*>?/gm, '') // Remove any other HTML tags
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
    return cleaned
  }

  const exportAsDoc = async () => {
    const cleanedContent = cleanContent(content)

    console.log('Original content:', content) // Log original content before cleaning
    console.log('Cleaned content for processing:', cleanedContent) // Log the cleaned content before passing to processor

    try {
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
                    after: 240, // Ensure enough space after paragraphs
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
                    before: 240, // Add space before the heading
                    after: 480, // Add more space after the heading to push the text to the next line
                    line: 1.5, // Optionally increase the line height
                  },
                },
              },
              heading2: {
                run: {
                  font: 'Arial',
                  bold: true,
                  size: 28,
                },
                paragraph: {
                  spacing: {
                    before: 240, // Add space before the heading
                    after: 480, // Add more space after the heading to push the text to the next line
                    line: 1.5, // Optionally increase the line height
                  },
                },
              },
              heading3: {
                run: {
                  font: 'Arial',
                  bold: true,
                  size: 28,
                },
                paragraph: {
                  spacing: {
                    before: 240, // Add space before the heading
                    after: 480, // Add more space after the heading to push the text to the next line
                    line: 1.5, // Optionally increase the line height
                  },
                },
              },
            },
          },
        })

      const doc = await processor.process(cleanedContent)
      console.log('Processed DOC content:', doc)

      const blob = await doc.result
      console.log('DOCX Blob:', blob)

      saveAs(
        blob as Blob,
        `lawgic_chat_export_${new Date().toLocaleTimeString()}`
      )

      toast.success('Message Exported')
    } catch (error) {
      console.error('Error during DOCX processing:', error)
      toast.error('Error exporting message')
    }
  }

  return (
    <div>
      <button
        onClick={exportAsDoc}
        className="p-1 rounded hover:bg-gray-200"
      >
        <DocumentDownload size={16} />
      </button>
    </div>
  )
}

export default ExportMessage
