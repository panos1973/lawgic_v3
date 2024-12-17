"use client";
import { NextPage } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Back,
  Happyemoji,
  MessageEdit,
  NoteAdd,
  Translate,
} from "iconsax-react";

interface Props {}

const ContractsTopNav: NextPage<Props> = () => {
  const path = usePathname();
  return (
    <div className="w-full m-auto flex items-center justify-center border-bs">
      {/* <Tabs
      >
        <TabsList className="m-auto">
          <TabsTrigger value={"assistant"} datatype="state-inactive">
            <Link href={`/contract/assistant`}>Assistant</Link>
          </TabsTrigger>
          <TabsTrigger value={"draft"}>
            {" "}
            <Link href={`/contract/draft`}>Draft</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs> */}
      <div className="flex space-x-3  border-x border-b rounded-b-xl">
        <div className="border-r px-2 py-3 w-24 hover:cursor-pointer flex items-center space-x-2 hover:bg-slate-100 transition-colors duration-500 rounded-bl-xl">
          <Happyemoji size={16} color="#99a3af" />
          <p className="text-xs text-center text-slate-500">Assistant</p>
        </div>
        <div className="border-r px-2 py-3 w-24 hover:cursor-pointer flex space-x-2">
          <NoteAdd size={16} color="#99a3af" />
          <p className="text-xs text-center text-slate-500">Draft</p>
        </div>
        <div className="border-r px-2 py-3 w-24 hover:cursor-pointer flex space-x-2">
          <Translate size={16} color="#99a3af" />
          <p className="text-xs text-center text-slate-500">Translate</p>
        </div>
        <div className="px-2 py-3 w-24 hover:cursor-pointer flex space-x-2">
          <Back size={16} color="#99a3af" />
          <p className="text-xs text-center text-slate-500">History</p>
        </div>
      </div>
    </div>
  );
};

export default ContractsTopNav;
