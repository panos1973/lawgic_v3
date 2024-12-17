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
import { useTranslations } from 'use-intl'
import { getTranslations } from 'next-intl/server'
import { CloseCircle } from 'iconsax-react' // Import the close icon
import { auth } from '@clerk/nextjs/server'
import { unstable_noStore as noStore } from 'next/cache'
import { getCaseStudies } from '@/app/[locale]/actions/case_study_actions'
import CaseStudyLinks from './case_study_links'

interface Props {}

const CaseMobileTopNav: NextPage<Props> = async () => {
  const t = await getTranslations('caseResearch.home')
  noStore()
  const { userId } = auth()
  const caseStudies = await getCaseStudies(userId!)
  const translations = await getTranslations('caseResearch.home')
  const caseStudyTranslations = {
    selectResearchForChatHistory: translations('selectResearchForChatHistory'),
    history: translations('researches'),
    massDelete: translations('massDelete'),
    cancel: translations('cancel'),
    accept: translations('accept'),
    deleteConfirmation: translations('deleteConfirmation'),
    deleteToastSuccess: translations('deleteToastSuccess'),
    deleteToastLoading: translations('deleteToastLoading'),
    massDeleteToastSuccess: translations('massDeleteToastSuccess'),
    massDeleteToastLoading: translations('massDeleteToastLoading'),
  }

  return (
    <>
      <div className="md:flex hidden w-full justify-between px-4 py-2">
        <Drawer>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              size="sm"
            >
              {t('researches')}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="relative flex flex-col items-center">
              <DrawerClose asChild>
                <button className="absolute right-2 top-1 md:hidden">
                  <CloseCircle className="h-6 w-6" />
                </button>
              </DrawerClose>
              <DrawerTitle className="w-full text-center">
                {t('researches')}
              </DrawerTitle>
              <DrawerDescription>
                {t('selectResearchForChatHistory')}
              </DrawerDescription>
            </DrawerHeader>
            <Suspense fallback={<ChatHistoryLoader />}>
              <CaseStudyHistory />
            </Suspense>
            <DrawerFooter>
              {/* <Button>Submit</Button> */}
              {/* <DrawerClose>
              <Button variant="outline">Cancel</Button>
            </DrawerClose> */}
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
        <CreateNewCaseStudy />
      </div>
      <div className="md:hidden">
        <CaseStudyLinks
          caseStudies={caseStudies}
          caseStudyTranslations={caseStudyTranslations}
        />
      </div>
    </>
  )
}

export default CaseMobileTopNav
