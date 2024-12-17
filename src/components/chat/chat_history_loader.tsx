import { NextPage } from "next";
import { Skeleton } from "../ui/skeleton";

interface Props {}

const ChatHistoryLoader: NextPage<Props> = () => {
  return (
    <div className="h-[93svh] px-2 py-4 space-y-4">
      <Skeleton className="w-full h-[50px] bg-slate-200" />
      <Skeleton className="w-full h-[50px] bg-slate-200" />
      <Skeleton className="w-full h-[50px] bg-slate-200" />
      <Skeleton className="w-full h-[50px] bg-slate-200" />
      <Skeleton className="w-full h-[50px] bg-slate-200" />
    </div>
  );
};

export default ChatHistoryLoader;
