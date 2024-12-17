'use client'
import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Icons } from '@/components/icons'
import { DocumentCloud, TickCircle } from 'iconsax-react'
import { NextPage } from 'next'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'use-intl'
import {
  createSectionsOfStandardContracts,
  createStandardContract,
} from '@/app/[locale]/actions/standard_contract_actions'

interface Props {
  contractChatId: string
}

interface FileUploadStatus {
  file: File
  isUploading: boolean
  uploaded: boolean
}

const UploadContractFile: NextPage<Props> = ({ contractChatId }) => {
  const t = useTranslations('standardContract.contracts')
  const [files, setFiles] = useState<FileUploadStatus[]>([])
  const auth = useAuth()
  const router = useRouter()
  const locale = useLocale() || 'el'

  const handleFileUpload = async (selectedFiles: File[]) => {
    let contractId = contractChatId

    if (!contractId) {
      contractId = await createStandardContract(auth.userId!)
    }

    const fileStatuses = selectedFiles.map((file) => ({
      file,
      isUploading: true,
      uploaded: false,
    }))

    setFiles((prevFiles) => [...prevFiles, ...fileStatuses])

    // Process files concurrently using Promise.all
    const uploadPromises = selectedFiles.map(async (selectedFile) => {
      const fileBase64 = await new Promise<string | ArrayBuffer | null>(
        (resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(selectedFile)
        }
      )

      if (fileBase64) {
        await createSectionsOfStandardContracts({
          userId: auth.userId!,
          contractId,
          base64Source: fileBase64 as string,
          fileName: selectedFile.name,
          fileType: selectedFile.name.split('.')[1],
          fileSize: selectedFile.size,
        })

        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.file.name === selectedFile.name
              ? { ...f, isUploading: false, uploaded: true }
              : f
          )
        )
      }
    })

    await Promise.all(uploadPromises)
    router.push(`/${locale}/standard-contract/${contractId}`)
  }

  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } =
    useDropzone({
      accept: {
        'application/pdf': [],
        'application/msword': [],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          [],
      },
      maxFiles: 3,
      onDrop: (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
          handleFileUpload(acceptedFiles)
        }
      },
    })

  const baseClasses =
    'flex flex-col items-center justify-center py-4 border-2 border-dashed rounded-2xl transition-all cursor-pointer'
  const focusClasses = isFocused ? 'border-blue-500' : 'border-gray-300'
  const acceptClasses = isDragAccept ? 'border-green-500' : ''
  const rejectClasses = isDragReject ? 'border-red-500' : ''

  return (
    <div>
      <div className="container">
        <div
          {...getRootProps({
            className: `${baseClasses} ${focusClasses} ${acceptClasses} ${rejectClasses}`,
          })}
        >
          <input
            {...getInputProps()}
            multiple={true}
          />
          <div className="flex flex-col justify-center items-center h-full">
            <DocumentCloud
              className="block"
              size={20}
            />
            <p className="text-center text-xs mt-1">{t('uploadContracts')}</p>
            <p className="text-xs text-slate-400 mt-1 font-light">
              {t('maxSize', { fileSize: '4' })}
            </p>
          </div>
        </div>
      </div>

      {/* Show each file upload status */}
      {files.length > 0 && (
        <div className="mt-2 space-y-2">
          {files.map((fileStatus, index) => (
            <div
              key={index}
              className="text-xs border rounded-xl py-3 bg-zinc-100 px-4 flex justify-between font-light"
            >
              <div className="flex space-x-3 text-slate-600">
                {fileStatus.isUploading ? (
                  <Icons.spinner className="animate-spin h-4 w-4" />
                ) : fileStatus.uploaded ? (
                  <TickCircle
                    size={16}
                    color="green"
                  />
                ) : null}
                <p>
                  {fileStatus.isUploading ? t('uploading') : t('uploaded')}...
                </p>
              </div>
              <p className="font-medium">{fileStatus.file.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default UploadContractFile

{
  /* Old Logic: Commented out */
}
{
  /*
      <Label
        htmlFor="file-upload"
        className="block border border-dashed py-4 rounded-2xl hover:cursor-pointer "
      >
        <div className="flex flex-col justify-center items-center h-full">
          <DocumentCloud className="block" size={20} />
          <p className="text-center text-xs mt-1">{t("uploadContracts")}</p>
          <p className="text-xs text-slate-400 mt-1 font-light">
            Max Size: 4MB
          </p>
        </div>
        <input
          type="file"
          id="file-upload"
          hidden
          accept="application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileUpload}
        />
      </Label>

      {uploading && (
        <div className="text-xs border rounded-xl py-3 bg-zinc-100 px-4 flex justify-between  mt-2 font-light">
          <div className="flex space-x-3 text-slate-600">
            <Icons.spinner className="animate-spin h-4 w-4" />
            <p>{t('uploading')}...</p>
          </div>
          <p className="font-medium">{file?.name}</p>
        </div>
      )}
      */
}
