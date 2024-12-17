import Chat from "@/components/chat/chat";
import MessageHistoryLoader from "@/components/chat/messages/message_loader";
import MessageHistory from "@/components/chat/messages/messages_history";
import { NextPage } from "next";
import { Suspense } from "react";
import { unstable_noStore as noStore } from "next/cache";

const ChatPage = ({ params }: { params: { id: string } }) => {
  noStore();
  return (
    <div>
      <Suspense fallback={<MessageHistoryLoader />}>
        <MessageHistory id={params.id} />
      </Suspense>
    </div>
  );
};

export default ChatPage;
