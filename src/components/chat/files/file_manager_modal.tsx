import { NextPage } from 'next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Document, TickCircle } from 'iconsax-react'
import UploadFile from './upload_file'

interface Props {
  chatId: string
  files: any
}

const FileManagerModal: NextPage<Props> = ({ chatId, files }) => {
  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="space-x-2 bg-transparent rounded-full"
          >
            <p>Upload</p>
            <Document size="16" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Your Case Files</DialogTitle>
            <DialogDescription>
              This where you can manage your case files.
            </DialogDescription>
          </DialogHeader>
          <UploadFile chatId={chatId} />
          <div className="mt-">
            <p className="text-sm mb-3 font-medium">Uploaded Documents</p>
            {files.map((file: any) => (
              <div
                key={file.id}
                className="flex flex-row justify-between items-center text-xs mb-2"
              >
                <p>{file.file_name}</p>

                <div className="flex space-x-2 items-center">
                  <p>{file.file_type}</p>

                  <TickCircle
                    size="18"
                    color="#37d67a"
                    variant="Bulk"
                  />
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FileManagerModal
