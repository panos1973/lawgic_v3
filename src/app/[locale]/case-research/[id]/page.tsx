import CaseMessageHistory from "@/components/case-study/messages/case_messages_history";
import MessageHistoryLoader from "@/components/chat/messages/message_loader";
import { Suspense } from "react";
import { unstable_noStore as noStore } from "next/cache";

export const maxDuration = 60;
const CasePage = ({ params }: { params: { id: string } }) => {
  noStore();
  return (
    <div className="flex">
      <div className="w-full">
        <Suspense fallback={<MessageHistoryLoader />}>
          <CaseMessageHistory id={params.id} />
        </Suspense>
      </div>
    </div>
  );
};

export default CasePage;
