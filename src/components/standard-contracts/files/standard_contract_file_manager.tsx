import { NextPage } from "next";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import { ContractFile, ContractSection } from "@/lib/types/types";
import { Notepad2, TickCircle, Trash } from "iconsax-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { toast } from "sonner";
import { deleteCaseStudyFile } from "@/app/[locale]/actions/case_study_actions";
import { useTranslations } from "use-intl";
import UploadContractFile from "./upload_file";
import ContractFileContentModal from "./file_content_modal";
import { Button } from "@/components/ui/button";

interface Props {
  contractId: string;
  sections: ContractSection[];
}

const ContractResourcesManager: NextPage<Props> = ({
  contractId,
  sections,
}) => {
  const t = useTranslations("contract.contracts");
  return (
    <div className="w-full h-full min-h-[80svh] ">
      <ResizablePanelGroup direction="vertical" className="min-h-[80svh] ">
        <ResizablePanel className="p-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium ">{t("contracts")}</p>
            {sections.length > 0 && (
              <p className="text-xs text-gray-500">{sections.length} Docs</p>
            )}
          </div>
          <UploadContractFile contractChatId={contractId} />
          {!sections.length && (
            <div className="flex flex-col justify-center items-center space-y-3 w-full">
              <p className="text-xs text-center mt-4">
                {t("noContractsUploade")}
              </p>
              <Notepad2 size={22} />
            </div>
          )}
          {sections.length > 0 && (
            <div className="mt-4">
              <p className="text-xs mb-2 font-medium text-gray-500">
                {t("contracts")}
              </p>

              {sections.map((file) => (
                <div
                  key={file.id}
                  className="flex flex-row justify-between items-center text-xs"
                >
                  <div className="flex space-x-2 items-center">
                    {/* <ContractFileContentModal file={file} /> */}
                    <TickCircle size="18" color="#37d67a" variant="Bulk" />
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button size="icon" variant="ghost" className="p-0 m-0">
                        <Trash size={18} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="text-sm">
                      <p className="font-medium">{t("delete")}</p>
                      <p className="text-xs mt-1">{t("deleteContract")}</p>
                      <Button
                        className="mt-2"
                        // onClick={() =>
                        //   toast.promise(
                        //     deleteCaseStudyFile(file.id, caseStudyId),
                        //     {
                        //       loading: "Deleting File...",
                        //       success: "File Deleted",
                        //       error: "Something went wrong...",
                        //     }
                        //   )
                        // }
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
        {/* <ResizableHandle withHandle />
        <ResizablePanel className="p-4">
          <p className="text-sm font-medium">{t("references")}</p>
        </ResizablePanel> */}
      </ResizablePanelGroup>
    </div>
  );
};

export default ContractResourcesManager;
