import { NextPage } from 'next'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Button } from '../ui/button'
import { Suspense } from 'react'
import ChatHistoryLoader from '../chat/chat_history_loader'
import CaseMessageHistory from './messages/case_messages_history'
import CreateNewCaseStudy from './create_new_case_study'
import CaseStudyHistory from './case_study_history'
import ResourcesManager from './resources_manager'
import { CaseStudyFile } from '@/lib/types/types'
import { Document } from 'iconsax-react'

interface Props {
  caseId: string
  files: CaseStudyFile[]
}

const ResourcesMobile: NextPage<Props> = ({ caseId, files }) => {
  return (
    <div>
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="space-x-2 rounded-full"
          >
            <Document size={16} />
            <p>Documents</p>
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Manage Your Documents</DrawerTitle>
            <DrawerDescription>Upload or Remove Resources</DrawerDescription>
          </DrawerHeader>
          <ResourcesManager
            caseStudyId={caseId}
            files={files}
            selectedFile={null}
            searchText={undefined}
            onCloseFile={function (): void {
              throw new Error('Function not implemented.')
            }}
          />
          <DrawerFooter>
            {/* <Button>Submit</Button> */}
            {/* <DrawerClose>
              <Button variant="outline">Cancel</Button>
            </DrawerClose> */}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

export default ResourcesMobile
