import MessageHistoryLoader from "@/components/chat/messages/message_loader";
import ContractMessageHistory from "@/components/contracts/messages/contract_messages_history";
import { Suspense } from "react";
import { unstable_noStore as noStore } from "next/cache";

export const maxDuration = 60;
// export const fetchCache = "force-no-store";
// export const dynamic = "force-dynamic";
const CasePage = ({ params }: { params: { id: string } }) => {
  noStore();
  return (
    <div className="flex">
      <div className="w-full">
        <Suspense fallback={<MessageHistoryLoader />}>
          <ContractMessageHistory id={params.id} />
        </Suspense>
      </div>
    </div>
  );
};

export default CasePage;
