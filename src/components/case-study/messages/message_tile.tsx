/* eslint-disable @next/next/no-img-element */
import { Message } from 'ai'
import { NextPage } from 'next'
import Markdown from 'markdown-to-jsx'
import { cn, relativeTimeFromDates } from '@/lib/utils'
import CopyMessage from '@/components/misc/copy_message'
import ExportMessage from '@/components/misc/export_message'
import { saveCaseMessage } from '@/app/[locale]/actions/case_study_actions'
import { useLocale } from 'next-intl'

interface Props {
  message: Message
  isGenerating: boolean
  caseId: string | any
  append: (message: { content: string; role: 'user' | 'assistant' }) => void
  onOpenFile: (filename: string, searchText: string) => void
  scrollToBottom: () => void
}

const MessageTile: NextPage<Props> = ({
  message: m,
  isGenerating,
  append,
  caseId,
  onOpenFile,
  scrollToBottom,
}) => {
  const locale = useLocale()
  const handleOpenFile = () => {
    const filename = 'DPA Template 1 English.docx'
    const searchText =
      '2.2. This Data Processing Agreement constitutes an integral and inseparable part of the Service Agreement. In case of conflict, the terms of this Data Processing Agreement shall prevail over those of the Service Agreement.'
    onOpenFile(filename, searchText)
  }
  const handleQuestionClick = (question: string) => {
    // Remove any numbering (e.g., "1.", "2.", etc.)
    const cleanedQuestion = question.replace(/^\d+\.\s*/, '')
    saveCaseMessage(caseId, 'user', cleanedQuestion)
    append({
      content: cleanedQuestion,
      role: 'user',
    })
    scrollToBottom()
  }

  const renderContentWithQuestions = (content: string) => {
    const referencesEnglishPattern =
      /\b(?:<b>|[*]{2})?\s*References\s*(?:<\/b>|[*]{2})?:?\s*\n?/i

    const referencesGreekPattern =
      /(?:<b>|[*]{2})\s*Παραπομπές\s*(?:<\/b>|[*]{2})?:?\s*\n?/i
    const englishQuestionsPattern =
      /(?:<b>|[*]{2})\s*Potential Useful Questions\s*(?:<\/b>|[*]{2})?:?\s*\n?/i
    const greekQuestionsPattern =
      /(?:<b>|[*]{2})\s*Πιθανές Χρήσιμες Ερωτήσεις\s*(?:<\/b>|[*]{2})?:?\s*\n?/i

    const referenceMap = new Map()
    console.log('Initial content:', content) // Log initial content

    // Extract and process References section (English)
    const englishReferencesMatch = content.match(referencesEnglishPattern)
    console.log('English references match:', englishReferencesMatch) // Log English references match result

    if (englishReferencesMatch) {
      const referencesContent = content
        .split(referencesEnglishPattern)[1]
        ?.trim()
      console.log('English references content (raw):', referencesContent) // Log extracted English references content

      if (referencesContent) {
        referencesContent
          .split('\n')
          .filter((line) => line.trim().length > 0)
          .forEach((line) => {
            console.log('Processing line (English):', line) // Log each line being processed
            const refMatch = line.match(/^\[(\d+)\]/)
            if (refMatch) {
              const refNumber = `[${refMatch[1]}]`
              const remainingText = line.replace(/^\[\d+\]\s*/, '')
              const [text, filename] = remainingText.split(' - ')
              if (text && filename) {
                referenceMap.set(refNumber, {
                  filename: filename.trim(),
                  searchText: text.trim(),
                })
                console.log('Added to referenceMap (English):', refNumber, {
                  filename: filename.trim(),
                  searchText: text.trim(),
                }) // Log the map entry
              }
            }
          })
        // Remove English references from content for clean rendering
        // content = content.split(referencesEnglishPattern)[0].trim()
        console.log('Content after removing English references:', content) // Log content after English references are removed
      }
    }

    // Extract and process References section (Greek)
    const greekReferencesMatch = content.match(referencesGreekPattern)
    console.log('Greek references match:', greekReferencesMatch) // Log Greek references match result

    if (greekReferencesMatch) {
      const referencesContent = content.split(referencesGreekPattern)[1]?.trim()
      console.log('Greek references content (raw):', referencesContent) // Log extracted Greek references content

      if (referencesContent) {
        referencesContent
          .split('\n')
          .filter((line) => line.trim().length > 0)
          .forEach((line) => {
            console.log('Processing line (Greek):', line) // Log each line being processed
            const refMatch = line.match(/^\[(\d+)\]/)
            if (refMatch) {
              const refNumber = `[${refMatch[1]}]`
              const remainingText = line.replace(/^\[\d+\]\s*/, '')
              const [text, filename] = remainingText.split(' - ')
              if (text && filename) {
                referenceMap.set(refNumber, {
                  filename: filename.trim(),
                  searchText: text.trim(),
                })
                console.log('Added to referenceMap (Greek):', refNumber, {
                  filename: filename.trim(),
                  searchText: text.trim(),
                }) // Log the map entry
              }
            }
          })
        // Remove Greek references from content for clean rendering
        // content = content.split(referencesGreekPattern)[0].trim()
        console.log('Content after removing Greek references:', content) // Log content after Greek references are removed
      }
    }

    // Apply references to transformed content
    let transformedContent = content.replace(/\[\s*(\d+)\s*\]/g, (match) => {
      const refKey = `[${match.match(/\d+/)?.[0]}]`
      console.log('Checking refKey:', refKey) // Log the refKey being checked
      if (referenceMap.has(refKey)) {
        console.log('Reference found in map:', refKey) // Log when a reference is found
        return `<a data-ref="${refKey}" class="reference-link">${refKey}</a>`
      }
      console.log('Reference not found in map:', refKey) // Log when a reference is not found
      return match
    })

    // // Append the "References" section if it exists
    // if (referenceMap.size > 0) {
    //   let referencesSection = `**References**:\n\n` // Bold the heading using markdown
    //   referenceMap.forEach((value, key) => {
    //     referencesSection += `${key} ${value.searchText} - ${value.filename}\n`
    //   })
    //   transformedContent += `\n\n${referencesSection}` // Add the references section at the end
    // }

    // Extract and handle Potential Useful Questions section
    const questionsMatch =
      englishQuestionsPattern.test(content) ||
      greekQuestionsPattern.test(content)
    console.log('Questions section match:', questionsMatch) // Log whether the questions section is matched

    let questionsSection: string[] = []

    if (questionsMatch) {
      const isEnglish = englishQuestionsPattern.test(content)
      console.log('Is English questions section:', isEnglish) // Log language type of questions section

      const parts = transformedContent.split(
        isEnglish ? englishQuestionsPattern : greekQuestionsPattern
      )
      console.log('Parts after splitting for questions:', parts) // Log parts after splitting content

      if (parts[1]) {
        questionsSection = parts[1]
          .split('\n')
          .filter((q) => q.trim().length > 0)
          .map((q) => q.replace(/^\*?\*?/, '').trim())
        console.log('Questions section:', questionsSection) // Log extracted questions

        transformedContent = parts[0]
      } else {
        console.log('No questions section found after the header.')
      }
    }

    return (
      <>
        <Markdown
          options={{
            overrides: {
              a: {
                component: (props) => {
                  const ref = props['data-ref']
                  const refData = referenceMap.get(ref)
                  if (refData) {
                    console.log('Rendering clickable reference:', ref) // Log rendering of clickable reference
                    return (
                      <span
                        className="text-blue-500 cursor-pointer"
                        onClick={() =>
                          handleReferenceClick(
                            refData.filename,
                            refData.searchText
                          )
                        }
                      >
                        {ref}
                      </span>
                    )
                  }
                  return <span>{props.children}</span>
                },
              },
            },
          }}
        >
          {transformedContent}
        </Markdown>

        {/* Display Potential Useful Questions Section */}
        {questionsSection.length > 0 && (
          <div className="mt-4">
            <b>
              {englishQuestionsPattern.test(content)
                ? 'Possible Useful Questions:'
                : 'Πιθανές Χρήσιμες Ερωτήσεις:'}
            </b>
            <ul className="list-none list-inside mt-2 space-y-2">
              {questionsSection.map((question, index) => (
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

  const handleReferenceClick = (filename: string, searchText: string) => {
    const cleanedText = searchText
      .replace(/^\[\d+\]\s*/, '')
      .replace(/^"(.*)"$/, '$1')

    console.log('Reference Text:', cleanedText)
    onOpenFile(filename, cleanedText)
  }

  return (
    <div
      className={cn('whitespace-pre-wrap text-sm mb-6 py-2 px-4 rounded-3xl ', {
        'self-end bg-slate-200  max-w-fit  md:max-w-[40svw] rounded-br-none text-right':
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

          <div className="flex">
            <ExportMessage content={m.content} />
            <CopyMessage content={m.content} />
          </div>
        </div>
      )}
    </div>
  )
}

export default MessageTile
