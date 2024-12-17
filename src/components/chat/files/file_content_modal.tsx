/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react'
import mammoth from 'mammoth'
import { NextPage } from 'next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Props {
  file: any
  searchText: string
  isOpen: boolean
  onClose: () => void
}

const FileContentModal: NextPage<Props> = ({
  file,
  searchText,
  isOpen,
  onClose,
}) => {
  const [originalContent, setOriginalContent] = useState<string>('')
  const [highlightedContent, setHighlightedContent] = useState<string>('')
  const dialogContentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (file.file_blob) {
      try {
        if (file.file_type === 'pdf') {
          // Create a Base64 data URL for the PDF
          const pdfDataUrl = `data:application/pdf;base64,${file.file_blob}`
          setOriginalContent(pdfDataUrl)
          setHighlightedContent(pdfDataUrl)
        } else if (
          file.file_type === 'jpeg' ||
          file.file_type === 'png' ||
          file.file_type === 'jpg'
        ) {
          // Create a Base64 data URL for the image
          const imageDataUrl = `data:image/${file.file_type};base64,${file.file_blob}`
          setOriginalContent(imageDataUrl)
          setHighlightedContent(imageDataUrl)
        } else {
          const binaryString = atob(file.file_blob)
          const len = binaryString.length
          const arrayBuffer = new Uint8Array(len)
          for (let i = 0; i < len; i++) {
            arrayBuffer[i] = binaryString.charCodeAt(i)
          }
          mammoth
            .convertToHtml({ arrayBuffer: arrayBuffer.buffer })
            .then((result) => {
              setOriginalContent(result.value)
              setHighlightedContent(result.value)
            })
            .catch((error) => {
              console.error('Error converting DOCX to HTML:', error)
              setOriginalContent('Unable to load document contents')
            })
        }
      } catch (error) {
        console.error('Error processing file:', error)
        setOriginalContent('Error opening file')
      }
    }
  }, [file.file_blob, file.file_type])

  useEffect(() => {
    if (searchText && originalContent) {
      const escapeRegExp = (string: string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      }

      const makeFlexiblePattern = (text: string) => {
        const escapedText = escapeRegExp(text)
        return escapedText.split(/\s+/).join('\\s*')
      }

      const createReducedPatterns = (text: string) => {
        const words = text.trim().split(/\s+/)
        const patterns = []
        for (let i = words.length; i >= 5; i--) {
          const reducedText = words.slice(0, i).join(' ')
          patterns.push(makeFlexiblePattern(reducedText))
        }
        return patterns
      }

      const reducedPatterns = createReducedPatterns(searchText)
      let matchedContent = originalContent
      let foundMatch = false

      for (const pattern of reducedPatterns) {
        const regex = new RegExp(`(${pattern})`, 'ig')
        if (regex.test(originalContent)) {
          matchedContent = originalContent.replace(
            regex,
            `<span id="first-match" style="color: blue; font-weight: bold;">$1</span>`
          )
          foundMatch = true
          break
        }
      }

      if (!foundMatch) {
        setHighlightedContent(originalContent)
      } else {
        setHighlightedContent(matchedContent)
      }
    } else {
      setHighlightedContent(originalContent)
    }
  }, [searchText, originalContent])

  useEffect(() => {
    if (isOpen && searchText) {
      setTimeout(() => {
        scrollToFirstMatch()
      }, 100)
    }
  }, [isOpen, highlightedContent, searchText])

  const scrollToFirstMatch = () => {
    if (dialogContentRef.current) {
      const matchElement = document.getElementById('first-match')
      if (matchElement) {
        matchElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }

  return (
    <div>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => !open && onClose()}
      >
        <DialogContent
          ref={dialogContentRef}
          className="max-w-[80svw] max-h-[90svh] w-fit h-fit overflow-hidden p-4 flex flex-col"
        >
          <DialogHeader className="max-h-[10svh] h-fit flex-shrink-0">
            <DialogTitle>{file.file_name}</DialogTitle>
            <DialogDescription>Content of this document</DialogDescription>
          </DialogHeader>
          {file.file_type === 'pdf' ? (
            <iframe
              src={highlightedContent}
              className="min-w-[75svw] min-h-[90svh] flex-grow border-none"
            ></iframe>
          ) : file.file_type === 'jpeg' ||
            file.file_type === 'png' ||
            file.file_type === 'jpg' ? (
            <div className="flex justify-center items-center flex-grow">
              <img
                src={highlightedContent}
                alt={file.file_name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <div
              className="mt-4 break-words flex-grow overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: highlightedContent }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FileContentModal
