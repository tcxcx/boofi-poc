import { AssistantModal } from "@/components/blockchain-assistant/assistant/assistant-modal";
import BooFiGhostCard from "@/components/blockchain-assistant/boofi-ghost-card";

export default function BlockchainAssistant() {
  return (
    <div className="relative flex flex-col items-center p-4 w-[300px]">
      {/* <div className="absolute top-2 right-2">
        <AssistantModal />
      </div> */}
      <BooFiGhostCard />
    </div>
  );
}
