import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "./theme/mode-toggle"
import { LogoutButton } from "./logout-button"

export function SiteHeader() {
  return (
    <header className="flex h-[var(--header-height)] py-1 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">NGS interno</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            {/* Conteúdo do botão aqui, se houver */}
          </Button>
        
        </div>
        <div className="flex gap-8">
          <ModeToggle />
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
