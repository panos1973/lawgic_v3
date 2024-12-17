import CreateNewChat from '@/components/chat/create_new_chat'

import { ArrowLeft, ArrowUp } from 'iconsax-react'
import { getTranslations } from 'next-intl/server'

const Page = async () => {
  const t = await getTranslations('lawbot.home')
  return (
    <div className="flex justify-center items-center   h-[83svh] md:h-[93svh]">
      <div className="mx-4 md:w-[50%]">
        {/* <div className="border rounded-xl px-8 py-6">
          <p
            className="font-medium text-sm md:text-base"
            dangerouslySetInnerHTML={{ __html: t.raw("welcome") }}
          ></p>
          <p className=" mt-2 text-xs md:text-sm">{t("message")}</p>
          <p className="font-medium mt-2 text-xs text-slate-500">
            {t("continueMessage")}
          </p>
        </div>
        <div className="border rounded-xl px-8 py-4 md:py-6 mt-4">
          <ArrowUp className="md:hidden mb-2" />
          <div className=" flex space-x-4 w-full mb-2">
            <p className="font-medium text-xs md:text-sm w-[70%]">
              {t("selectChat")}
            </p>
            <div className="w-[30%]">
              <CreateNewChat variant="outline" />
            </div>
          </div>
          <ArrowLeft className="hidden md:block" />
        </div> */}
        <div className="flex flex-col justify-center items-center w-full h-full max-h-[60svh] md:max-h-[80svh]  overflow-y-scroll no-scrollbar -mt-[10svh] md:mt-0">
          <div className="border rounded-xl  w-full   overflow-x-auto ">
            <p
              className="font-medium text-sm md:text-base py-4 px-8 border-b text-center"
              dangerouslySetInnerHTML={{ __html: t.raw('welcome') }}
            ></p>
            <div className="flex h-full items-center overflow-x-auto overflow-y-hidden no-scrollbar">
              {/* Adjust the container to handle overflow */}
              <div className="px-4 py-2 border-l">
                <p
                  className="text-xs md:text-sm"
                  dangerouslySetInnerHTML={{ __html: t.raw('message') }}
                ></p>
              </div>
            </div>
            <p className="text-xs text-slate-700 px-4 py-2 border-t font-light text-center">
              {t('continueMessage')}
            </p>
          </div>
          <div className="border rounded-xl  mt-4  ">
            {/* <ArrowUp className="md:hidden mb-2" /> */}

            <div className=" flex items-center justify-center space-x-4 w-full pr-8 pl-4">
              <div className="border-r min-h-full w-full py-3 pr-1">
                <p className="font-medium  text-xs md:text-sm ">
                  {t('selectChat')}
                </p>
              </div>
              <div className="w-[40%]">
                <CreateNewChat variant="outline" />
              </div>
            </div>
            {/* <div className="mx-8 my-2 hidden md:flex items-center space-x-2 ">
            <ArrowLeft />
            <div className="text-xs text-slate-700 font-light">
              {" "}
              Select One{" "}
            </div>
          </div> */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
