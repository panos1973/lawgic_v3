import { NextPage } from "next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { chatModels } from "@/lib/consts";
import { log } from "console";
import { Icons } from "../icons";
import { MagicStar } from "iconsax-react";

interface Props {
  model: string;
  setModel(model: string): void;
}

const ChatModelSelector: NextPage<Props> = ({ setModel, model }) => {
  return (
    <div>
      <Select value={model} onValueChange={setModel} disabled>
        <SelectTrigger className="text-xs rounded-full w-[155px] space-x-1">
          {/* <Icons.sparkles className="h-2 w-2" /> */}
          <MagicStar size={12} />
          <SelectValue placeholder="Model" />
        </SelectTrigger>
        <SelectContent>
          {chatModels.map((model, i) => (
            <SelectItem className="text-xs" key={i} value={model}>
              {model}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ChatModelSelector;
