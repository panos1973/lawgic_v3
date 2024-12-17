import { useState } from "react";

import { NextPage } from "next";
import { Copy } from "iconsax-react";
import { toast } from "sonner";
interface Props {
  content: string;
}

const CopyMessage: NextPage<Props> = ({ content }) => {
  //   const [copied, setCopied] = useState(false);
  const copy = async () => {
    toast.promise(navigator.clipboard.writeText(content), {
      success: "Copied",
    });
    // setCopied(true);
  };
  return (
    <div>
      <div className={`flex`}>
        <button onClick={copy} className="p-1 rounded hover:bg-gray-200">
          <Copy size={16} />
        </button>
      </div>
    </div>
  );
};

export default CopyMessage;
