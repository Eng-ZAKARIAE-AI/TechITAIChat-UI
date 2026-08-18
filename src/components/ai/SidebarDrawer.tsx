import { useState } from "react"
import { Plus, Settings, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

interface Conversation {
  id: string
  title: string
  time: "today" | "yesterday" | "previous7Days"
}

const mockConversations: Conversation[] = [
  { id: "1", title: "Incidents for NDR1CKB001", time: "today" },
  { id: "2", title: "Hydraulic system analysis", time: "today" },
  { id: "3", title: "Maintenance schedule review", time: "yesterday" },
  { id: "4", title: "Risk assessment Q4", time: "yesterday" },
  { id: "5", title: "Fleet compliance report", time: "previous7Days" },
  { id: "6", title: "Avionics inspection logs", time: "previous7Days" },
  { id: "7", title: "Landing gear overdue tasks", time: "previous7Days" },
]

const groups = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "previous7Days", label: "Previous 7 Days" },
]

interface SidebarProps {
  isOpen: boolean
  activeId?: string
}

export function Sidebar({ isOpen, activeId }: SidebarProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark")

  return (
    <aside
      className={cn(
        "flex h-screen w-[260px] shrink-0 flex-col border-r border-[#2E2E2E] bg-[#141414] transition-all duration-300 ease-in-out",
        !isOpen && "w-0 -translate-x-full opacity-0 md:w-0 md:translate-x-0"
      )}
    >
      {isOpen && (
        <div className="flex h-full w-[260px] flex-col">
          <div className="p-4">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#333333] px-3 py-2.5 text-sm font-medium text-white transition-colors hover:border-[#3B82F6] hover:bg-[#1E1E1E]"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-3">
            {groups.map(group => {
              const items = mockConversations.filter(c => c.time === group.key)
              if (!items.length) return null
              return (
                <div key={group.key} className="mb-3">
                  <p className="text-muted-foreground mb-1.5 px-2 text-xs font-medium">{group.label}</p>
                  <div className="space-y-1">
                    {items.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        className={cn(
                          "block w-full rounded-md px-4 py-2 text-left text-sm transition-colors",
                          activeId === item.id
                            ? "bg-[#252525] text-white"
                            : "text-[#9CA3AF] hover:bg-[#252525] hover:text-white"
                        )}
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="border-t border-[#2E2E2E] p-4">
            <div className="mb-3 flex items-center gap-3 rounded-lg px-2 py-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-[#252525] text-xs font-semibold text-white">U</div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">User</p>
                <p className="truncate text-xs text-[#9CA3AF]">user@example.com</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex flex-1 items-center gap-2 rounded-lg px-2 py-2 text-sm text-[#9CA3AF] transition-colors hover:bg-[#252525] hover:text-white"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </button>
              <button
                type="button"
                className="flex flex-1 items-center gap-2 rounded-lg px-2 py-2 text-sm text-[#9CA3AF] transition-colors hover:bg-[#252525] hover:text-white"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
