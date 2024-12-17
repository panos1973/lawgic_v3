import { useState, useEffect } from 'react'
import { NextPage } from 'next'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import UploadFile from './files/upload_file'
import { CaseStudyFile } from '@/lib/types/types'
import { Notepad2, TickCircle, Trash } from 'iconsax-react'
import FileContentModal from './files/file_content_modal'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '../ui/button'
import { toast } from 'sonner'
import { deleteCaseStudyFile } from '@/app/[locale]/actions/case_study_actions'
import { useTranslations } from 'use-intl'

interface Props {
  caseStudyId: string
  files: CaseStudyFile[]
  selectedFile: string | null
  searchText: string | any
  onCloseFile: () => void
}

const ResourcesManager: NextPage<Props> = ({
  caseStudyId,
  files,
  selectedFile,
  searchText,
  onCloseFile,
}) => {
  const [openFile, setOpenFile] = useState<CaseStudyFile | null>(null)
  const t = useTranslations('caseResearch.docs')
  useEffect(() => {
    console.log('useEffect triggered. Selected file:', selectedFile)
    console.log('Files available:', files)
    if (selectedFile) {
      const file = files.find((file) => file.file_name === selectedFile)
      console.log('Matching file found:', file)

      if (file) {
        setOpenFile(file)
        console.log('openFile set to:', file)
      } else {
        console.log('No matching file found for selectedFile:', selectedFile)
      }
    } else {
      console.log('No selected file provided.')
    }
  }, [selectedFile, files])
  const handleCloseModal = () => {
    setOpenFile(null)
    onCloseFile()
  }
  return (
    <div className="border-l w-full h-full min-h-[80svh]">
      <ResizablePanelGroup
        direction="vertical"
        className="min-h-[80svh]"
      >
        <ResizablePanel className="p-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium">{t('resources')}</p>
            {files.length > 0 && (
              <p className="text-xs text-gray-500">{files.length} Docs</p>
            )}
          </div>
          <UploadFile caseStudyId={caseStudyId} />
          {!files.length && (
            <div className="flex flex-col justify-center items-center space-y-3 w-full">
              <p className="text-xs text-center mt-4">{t('noDocUploaded')}</p>
              <Notepad2 size={22} />
            </div>
          )}
          {files.length > 0 && (
            <div className="mt-4">
              <p className="text-xs mb-2 font-medium text-gray-500">
                {t('documents')}
              </p>
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex flex-row justify-between items-center text-xs"
                >
                  <div className="flex space-x-2 items-center">
                    <Button
                      size="sm"
                      variant="link"
                      className="p-0 m-0 max-h-[15px] text-gray-950"
                      onClick={() => setOpenFile(file)}
                    >
                      {file.file_name}
                    </Button>
                    <TickCircle
                      size="18"
                      color="#37d67a"
                      variant="Bulk"
                    />
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="p-0 m-0"
                      >
                        <Trash size={18} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="text-sm">
                      <p className="font-medium">{t('deleteFile')}</p>
                      <p className="text-xs mt-1">{t('deleteFileWarning')}</p>
                      <Button
                        className="mt-2"
                        onClick={() =>
                          toast.promise(
                            deleteCaseStudyFile(file.id, caseStudyId),
                            {
                              loading: 'Deleting File...',
                              success: 'File Deleted',
                              error: 'Something went wrong...',
                            }
                          )
                        }
                      >
                        Delete
                      </Button>
                    </PopoverContent>
                  </Popover>
                </div>
              ))}
            </div>
          )}
        </ResizablePanel>
        <ResizableHandle withHandle />
      </ResizablePanelGroup>
      {openFile && (
        <FileContentModal
          file={openFile}
          searchText={selectedFile ? searchText : ''}
          isOpen={Boolean(openFile)}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

export default ResourcesManager
