import { NextPage } from "next";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {}

const MessageHistoryLoader: NextPage<Props> = () => {
  return (
    <div className="p-12 flex flex-col space-y-3">
      <Skeleton className="w-[100px] h-[40px] rounded-full bg-slate-200 self-end" />
      <Skeleton className="w-[70%] md:w-[50%] h-[100px] rounded-2xl bg-slate-200 " />
      <Skeleton className="w-[55%] md:w-[35%] h-[100px] rounded-2xl bg-slate-200 " />
      <Skeleton className="w-[100px] h-[40px] rounded-full bg-slate-200 self-end" />
      <Skeleton className="w-[150px] h-[40px] rounded-full bg-slate-200 self-end" />
    </div>
  );
};

export default MessageHistoryLoader;
