import { NextPage } from "next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Document, TickCircle } from "iconsax-react";
import UploadFile from "./upload_file";
import { ContractFile } from "@/lib/types/types";

interface Props {
  file: ContractFile;
}

const ContractFileContentModal: NextPage<Props> = ({ file }) => {
  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="link"
            className="p-0 m-0 max-h-[15px text-gray-950"
          >
            {file.file_name}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[70svh] max-w-[50svw] overflow-y-scroll">
          <DialogHeader>
            <DialogTitle>{file.file_name}</DialogTitle>
            <DialogDescription>Content of the this document</DialogDescription>
          </DialogHeader>
          <div className="mt-">
            <p>{file.file_content}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContractFileContentModal;
