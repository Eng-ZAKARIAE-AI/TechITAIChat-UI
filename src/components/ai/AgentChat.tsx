import { useState } from "react"
import { ChatContainerRoot, ChatContainerContent, ChatContainerScrollAnchor } from "@/components/ui/chat-container"
import { ScrollButton } from "@/components/ui/scroll-button"
import { Message, MessageAvatar } from "@/components/ui/message"
import { PromptInput, PromptInputTextarea } from "@/components/ui/prompt-input"
import { Loader, TextShimmerLoader } from "@/components/ui/loader"
import { Markdown } from "@/components/ui/markdown"
import { Reasoning, ReasoningTrigger, ReasoningContent } from "@/components/ui/reasoning"
import { CodeBlock, CodeBlockCode } from "@/components/ui/code-block"
import { ResponseStream } from "@/components/ui/response-stream"
import { FileUpload, FileUploadTrigger } from "@/components/ui/file-upload"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Send, Paperclip, Square, PanelLeftClose, PanelLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Sidebar } from "@/components/ai/SidebarDrawer"

type MessageRole = "user" | "assistant"

interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  reasoning?: string
  isStreaming?: boolean
  files?: { name: string; size: number }[]
}

const mockSuggestions = [
  "Show incidents for NDR1CKB001",
  "Analyze the latest incidents",
  "What equipment needs maintenance?",
  "Generate a maintenance report",
]

const mockResponses: Record<string, { content: string; reasoning?: string }> = {
  "Show incidents for NDR1CKB001": {
    content: `I found **3 incidents** for equipment **NDR1CKB001**:

| Incident ID | Date | Status | Severity |
|-------------|------|--------|----------|
| INC-2024-001 | 2024-12-15 | Open | High |
| INC-2024-045 | 2024-11-28 | Resolved | Medium |
| INC-2024-089 | 2024-10-05 | Resolved | Low |

**Recommended action:** Schedule maintenance for the hydraulic system within the next 48 hours.`,
    reasoning: "Querying SITA EAM database for equipment ID NDR1CKB001... Filtering by incident records... Sorting by severity... Formatting results as markdown table.",
  },
  "Analyze the latest incidents": {
    content: `Based on the latest incident data, here's the analysis:

**Trends identified:**
- Hydraulic system failures increased by **15%** over the last quarter
- Average resolution time: **4.2 hours**
- Most common root cause: seal degradation

**Risk Assessment:**
- High risk: NDR1CKB001, NDR1CKB003
- Medium risk: NDR1CKB007
- Low risk: All other tracked equipment`,
    reasoning: "Analyzing incident database trends... Calculating failure rates... Cross-referencing with maintenance logs... Generating risk assessment matrix.",
  },
  "What equipment needs maintenance?": {
    content: `**Priority Maintenance Schedule:**

1. **NDR1CKB001** - Hydraulic System (Due: 2024-12-20)
2. **NDR1CKB003** - Landing Gear (Due: 2024-12-22)
3. **NDR1CKB007** - Avionics (Due: 2024-12-28)

**Next 7 days:** 5 scheduled maintenance tasks
**Overdue:** 1 task (NDR1CKB001 - brake inspection)`,
    reasoning: "Querying maintenance schedule database... Filtering by due dates... Prioritizing by urgency... Generating maintenance task list.",
  },
  "Generate a maintenance report": {
    content: `**AeroGuard Maintenance Report**
*Generated: ${new Date().toLocaleDateString()}*

**Summary:**
- Total equipment tracked: 42
- Scheduled maintenance: 12
- Completed this month: 8
- Pending approvals: 3

\`\`\`json
{
  "fleetStatus": "operational",
  "complianceRate": "98.2%",
  "nextAudit": "2025-01-15"
}
\`\`\``,
    reasoning: "Compiling maintenance data... Generating report template... Inserting statistics... Formatting as markdown with code blocks.",
  },
}

export function AgentChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleSubmit = () => {
    if (!input.trim() && uploadedFiles.length === 0) return
    if (isLoading) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      files: uploadedFiles.map(f => ({ name: f.name, size: f.size })),
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setUploadedFiles([])
    setIsLoading(true)

    setTimeout(() => {
      const response = mockResponses[userMessage.content] || {
        content: `I understand you're asking about: **"${userMessage.content}"**\n\nThis is a demo response. In a production environment, this would connect to the AeroGuard backend and SITA EAM system to provide real-time equipment maintenance data and analysis.`,
        reasoning: "Processing user query... Matching against knowledge base... Generating contextual response...",
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.content,
        reasoning: response.reasoning,
        isStreaming: true,
      }

      setMessages(prev => [...prev, assistantMessage])

      setTimeout(() => {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessage.id ? { ...msg, isStreaming: false } : msg
          )
        )
        setIsLoading(false)
      }, 2000)
    }, 500)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    setTimeout(() => {
      handleSubmit()
    }, 100)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const stopGeneration = () => {
    setIsLoading(false)
    setMessages(prev =>
      prev.map(msg =>
        msg.isStreaming ? { ...msg, isStreaming: false } : msg
      )
    )
  }

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar isOpen={sidebarOpen} />
      <main className="flex flex-1 flex-col min-w-0">
        <header className="bg-background border-border flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(prev => !prev)}
              className="text-muted-foreground hover:text-foreground inline-flex size-9 items-center justify-center rounded-lg transition-colors"
            >
              {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
            </button>
            <div>
              <h1 className="text-foreground text-lg font-semibold leading-none">TechITAIChat </h1>
              <p className="text-muted-foreground mt-1 text-xs">Your AI-powered maintenance assistant </p>
            </div>
          </div>
        </header>

        {messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex w-full max-w-[768px] flex-col items-center px-6">
              <div className="flex flex-col items-center gap-4">
                <h2 className="text-foreground text-xl font-semibold">Hi Manager, how can I help you?</h2>
                <p className="text-muted-foreground max-w-md text-center text-sm">
                  Ask me about equipment status, incidents, maintenance schedules, and predictive analytics.
                </p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                {["Equipment", "Incidents", "Maintenance", "Predictions", "Reports", "SITA EAM"].map(
                  (capability) => (
                    <div
                      key={capability}
                      className="bg-[#252525] border-[#333333] text-foreground flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-[#333333]"
                    >
                      {capability}
                    </div>
                  )
                )}
              </div>
              <div className="mt-8 w-full">
                <div className="grid grid-cols-2 gap-3">
                  {mockSuggestions.map((suggestion) => {
                    const boldWords = suggestion.split(" ").slice(0, 2).join(" ")
                    const lowerSuggestion = suggestion.toLowerCase()
                    const lowerBold = boldWords.toLowerCase()
                    const index = lowerSuggestion.indexOf(lowerBold)
                    const before = suggestion.substring(0, index)
                    const after = suggestion.substring(index + boldWords.length)
                    return (
                      <div
                        key={suggestion}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="cursor-pointer rounded-lg border border-[#333333] bg-[#1E1E1E] p-3 transition-all duration-200 hover:border-[#3B82F6] hover:shadow-sm hover:shadow-[#3B82F6]/10"
                      >
                        <p className="text-xs leading-relaxed">
                          {before && <span className="text-[#9CA3AF]">{before}</span>}
                          <span className="text-white font-semibold">{boldWords}</span>
                          {after && <span className="text-[#9CA3AF]">{after}</span>}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="mt-5 w-full">
                <TooltipProvider>
                  <PromptInput
                    value={input}
                    onValueChange={setInput}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    className="relative rounded-lg border border-[#333333] bg-[#1E1E1E] p-1 transition-all focus-within:border-[#3B82F6] focus-within:ring-1 focus-within:ring-[#3B82F6]/50"
                  >
                    {uploadedFiles.length > 0 && (
                      <div className="text-[#9CA3AF] flex flex-wrap gap-2 px-2 pb-2 text-xs">
                        {uploadedFiles.map((file, idx) => (
                          <span key={idx} className="bg-[#252525] border-[#333333] flex items-center gap-1 rounded-md px-2 py-1">
                            <Paperclip className="h-3 w-3" />
                            {file.name}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="relative flex items-end">
                      <PromptInputTextarea
                        placeholder="Ask about equipment, incidents, maintenance..."
                        onKeyDown={handleKeyDown}
                        className="min-h-[52px] pr-24 pl-10 py-3 text-white placeholder:text-[#9CA3AF]"
                      />
                      <div className="absolute bottom-2 left-2">
                        <Tooltip>
                          <TooltipTrigger>
                            <FileUpload accept=".csv,.json,.txt,.pdf" multiple onFilesAdded={setUploadedFiles}>
                              <FileUploadTrigger asChild>
                                <button type="button" className="text-[#9CA3AF] hover:text-white h-8 w-8 flex items-center justify-center rounded-lg transition-colors">
                                  <Paperclip className="h-5 w-5" />
                                </button>
                              </FileUploadTrigger>
                            </FileUpload>
                          </TooltipTrigger>
                          <TooltipContent side="top">Attach file</TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="absolute bottom-2 right-2">
                        {isLoading ? (
                          <Tooltip>
                            <TooltipTrigger>
                              <button
                                type="button"
                                onClick={stopGeneration}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-500 transition-colors hover:bg-red-500/20"
                              >
                                <Square className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Stop generating</TooltipContent>
                          </Tooltip>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!input.trim()}
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-full transition-all",
                              input.trim()
                                ? "bg-[#3B82F6] text-white hover:bg-[#3B82F6]/90 shadow-sm shadow-[#3B82F6]/30"
                                : "bg-[#333333] text-[#9CA3AF]"
                            )}
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </PromptInput>
                </TooltipProvider>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-1 overflow-hidden">
              <ChatContainerRoot className="flex-1">
                <ChatContainerContent className="gap-6 px-6 py-4">
                  {messages.map((message) => (
                    <Message key={message.id}>
                      <MessageAvatar
                        src=""
                        alt={message.role === "user" ? "You" : "AeroGuard"}
                        fallback={message.role === "user" ? "U" : "AG"}
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground text-sm font-medium">
                            {message.role === "user" ? "You" : "AeroGuard"}
                          </span>
                          {message.isStreaming && (
                            <TextShimmerLoader text="Thinking" size="sm" />
                          )}
                        </div>
                        {message.reasoning && !message.isStreaming && (
                          <Reasoning>
                            <ReasoningTrigger className="text-muted-foreground text-xs">
                              Reasoning
                            </ReasoningTrigger>
                            <ReasoningContent markdown className="text-xs">
                              {message.reasoning}
                            </ReasoningContent>
                          </Reasoning>
                        )}
                        {message.isStreaming ? (
                          <div className="rounded-lg p-2 text-foreground bg-secondary prose break-words whitespace-normal">
                            <ResponseStream
                              textStream={message.content}
                              mode="typewriter"
                              speed={30}
                            />
                          </div>
                        ) : (
                          <Markdown
                            components={{
                              code: ({ className, children, ...props }) => {
                                const match = /language-(\w+)/.exec(className || "")
                                const isInline = !match && !className
                                return isInline ? (
                                  <code
                                    className="bg-muted text-foreground rounded-md px-1.5 py-0.5 font-mono text-xs"
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                ) : (
                                  <CodeBlock>
                                    <CodeBlockCode code={String(children).replace(/\n$/, "")} language={match?.[1] || "text"} />
                                  </CodeBlock>
                                )
                              },
                            }}
                          >
                            {message.content}
                          </Markdown>
                        )}
                        {message.files && message.files.length > 0 && (
                          <div className="text-muted-foreground flex flex-wrap gap-2 text-xs">
                            {message.files.map((file, idx) => (
                              <span key={idx} className="bg-[#252525] border-[#333333] flex items-center gap-1 rounded-md px-2 py-1">
                                <Paperclip className="h-3 w-3" />
                                {file.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Message>
                  ))}

                  {isLoading && messages[messages.length - 1]?.role === "user" && (
                    <Message>
                      <MessageAvatar fallback="AG" alt="AeroGuard" src="" />
                      <div className="flex-1">
                        <span className="text-foreground text-sm font-medium">AeroGuard</span>
                        <div className="mt-2">
                          <Loader variant="dots" size="sm" />
                        </div>
                      </div>
                    </Message>
                  )}

                  <ChatContainerScrollAnchor />
                </ChatContainerContent>
                <ScrollButton className="absolute bottom-24 right-8" />
              </ChatContainerRoot>
            </div>

            <div className="border-border bg-background border-t px-4 py-4">
              <TooltipProvider>
                <PromptInput
                  value={input}
                  onValueChange={setInput}
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                  className="mx-auto max-w-[800px] relative rounded-lg border border-[#333333] bg-[#1E1E1E] p-1 transition-all focus-within:border-[#3B82F6] focus-within:ring-1 focus-within:ring-[#3B82F6]/50"
                >
                  {uploadedFiles.length > 0 && (
                    <div className="text-[#9CA3AF] flex flex-wrap gap-2 px-2 pb-2 text-xs">
                      {uploadedFiles.map((file, idx) => (
                        <span key={idx} className="bg-[#252525] border-[#333333] flex items-center gap-1 rounded-md px-2 py-1">
                          <Paperclip className="h-3 w-3" />
                          {file.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="relative flex items-end">
                    <PromptInputTextarea
                      placeholder="Ask about equipment, incidents, maintenance..."
                      onKeyDown={handleKeyDown}
                      className="min-h-[52px] pr-24 pl-10 py-3 text-white placeholder:text-[#9CA3AF]"
                    />
                    <div className="absolute bottom-2 left-2">
                      <Tooltip>
                        <TooltipTrigger>
                          <FileUpload accept=".csv,.json,.txt,.pdf" multiple onFilesAdded={setUploadedFiles}>
                            <FileUploadTrigger asChild>
                              <button type="button" className="text-[#9CA3AF] hover:text-white h-8 w-8 flex items-center justify-center rounded-lg transition-colors">
                                <Paperclip className="h-5 w-5" />
                              </button>
                            </FileUploadTrigger>
                          </FileUpload>
                        </TooltipTrigger>
                        <TooltipContent side="top">Attach file</TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="absolute bottom-2 right-2">
                      {isLoading ? (
                        <Tooltip>
                          <TooltipTrigger>
                            <button
                              type="button"
                              onClick={stopGeneration}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-500 transition-colors hover:bg-red-500/20"
                            >
                              <Square className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">Stop generating</TooltipContent>
                        </Tooltip>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={!input.trim()}
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full transition-all",
                            input.trim()
                              ? "bg-[#3B82F6] text-white hover:bg-[#3B82F6]/90 shadow-sm shadow-[#3B82F6]/30"
                              : "bg-[#333333] text-[#9CA3AF]"
                          )}
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </PromptInput>
              </TooltipProvider>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
