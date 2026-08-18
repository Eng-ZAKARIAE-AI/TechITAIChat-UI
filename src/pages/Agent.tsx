import { AgentChat } from "@/components/ai/AgentChat"
import { TooltipProvider } from "@/components/ui/tooltip"

function AgentPage() {
  return (
    <TooltipProvider>
      <AgentChat />
    </TooltipProvider>
  )
}

export default AgentPage
