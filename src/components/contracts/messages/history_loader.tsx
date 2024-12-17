import { NextPage } from "next";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {}

const ContractHistoryLoader: NextPage<Props> = () => {
  return (
    <div className="p-1 h-[5svh] flex space-x-3">
      <Skeleton className="w-[120px] h-full  bg-slate-200 self-end" />
      <Skeleton className="w-[120px] h-full  bg-slate-200 " />
    </div>
  );
};

export default ContractHistoryLoader;
