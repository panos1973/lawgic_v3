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
import ResourcesManager from './standard_contract_file_manager'
import { ContractFile } from '@/lib/types/types'
import { Document, MenuBoard } from 'iconsax-react'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import ContractResourcesManager from './standard_contract_file_manager'

interface Props {
  //   contractChatId: string;
  //   files: ContractFile[];
}

const ContractResourcesMobile: NextPage<Props> = (
  {
    //   contractChatId,
    //   files,
  }
) => {
  const t = useTranslations('contract.contracts')
  return (
    <div>
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="space-x-2 rounded-full"
          >
            <MenuBoard size={16} />
            <p className="hidden md:block">{t('contracts')}</p>
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{t('manageYourContracts')}</DrawerTitle>
            <DrawerDescription>
              {t('uploadOrRemoveContracts')}
            </DrawerDescription>
          </DrawerHeader>
          {/* <ContractResourcesManager
            contractChatId={contractChatId}
            files={files}
          /> */}
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

export default ContractResourcesMobile
