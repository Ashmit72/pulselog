"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
	Activity,
	BookOpen,
	ChevronDown,
	ChevronsLeft,
	ChevronsRight,
	CircleGauge,
	KeyRound,
	Menu,
	Plus,
	Radio,
	Search,
	Settings,
	TerminalSquare,
	X,
} from "lucide-react"

import { ThemeToggler } from "@/components/theme-toggler"
import { Button, IconButton } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuDivider,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const navigation = [
	{ label: "Dashboard", href: "/", icon: CircleGauge },
	{ label: "Logs", href: "/logs", icon: TerminalSquare },
	{ label: "API keys", href: "/api-keys", icon: KeyRound },
	{ label: "Settings", href: "/settings", icon: Settings },
]

const workspaces = ["PulseLog Production", "PulseLog Staging"]

export function DashboardShell() {
	const pathname = usePathname()
	const [isCollapsed, setIsCollapsed] = useState(false)
	const [isMobileOpen, setIsMobileOpen] = useState(false)
	const [workspace, setWorkspace] = useState(workspaces[0])

	return (
		<div className="min-h-svh bg-bg">
			{isMobileOpen && (
				<Button
					aria-label="Close navigation"
					variant="ghost"
					color="neutral"
					className="fixed inset-0 z-30 h-auto w-full rounded-none bg-black-inverse/35 p-0 lg:hidden"
					onClick={() => setIsMobileOpen(false)}>
					<span className="sr-only">Close navigation</span>
				</Button>
			)}

			<aside
				className={cn(
					"fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-border bg-elevation-level1 transition-[width,transform] duration-200",
					isCollapsed && "lg:w-[4.5rem]",
					isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
				)}>
				<div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-4">
					<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
						<Activity className="size-5" aria-hidden="true" />
					</div>
					<div className={cn("min-w-0", isCollapsed && "lg:hidden")}>
						<p className="truncate text-sm font-semibold tracking-tight">PulseLog</p>
						<p className="truncate text-xs text-fg-tertiary">Observability</p>
					</div>
					<IconButton
						aria-label="Close navigation"
						variant="ghost"
						color="neutral"
						size="32"
						className="ml-auto lg:hidden"
						onClick={() => setIsMobileOpen(false)}>
						<X />
					</IconButton>
				</div>

				<nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Primary navigation">
					{navigation.map((item) => {
						const isActive =
							item.href === "/"
								? pathname === "/" || pathname === "/dashboard"
								: pathname.startsWith(item.href)
						const Icon = item.icon

						return (
							<Button
								key={item.href}
								asChild
								variant={isActive ? "soft" : "ghost"}
								color={isActive ? "primary" : "neutral"}
								size="40"
								className={cn(
									"w-full justify-start px-3",
									isCollapsed && "lg:justify-center lg:px-0"
								)}>
								<Link
									href={item.href}
									title={isCollapsed ? item.label : undefined}
									aria-current={isActive ? "page" : undefined}
									onClick={() => setIsMobileOpen(false)}>
									<Icon aria-hidden="true" />
									<span className={cn(isCollapsed && "lg:sr-only")}>{item.label}</span>
								</Link>
							</Button>
						)
					})}
				</nav>

				<div className="border-t border-border p-3">
					<Button
						variant="ghost"
						color="neutral"
						size="36"
						className={cn(
							"w-full justify-start px-3",
							isCollapsed && "lg:justify-center lg:px-0"
						)}
						onClick={() => setIsCollapsed((value) => !value)}>
						{isCollapsed ? <ChevronsRight /> : <ChevronsLeft />}
						<span className={cn(isCollapsed && "lg:sr-only")}>Collapse sidebar</span>
					</Button>
				</div>
			</aside>

			<div
				className={cn(
					"min-h-svh transition-[padding] duration-200 lg:pl-60",
					isCollapsed && "lg:pl-[4.5rem]"
				)}>
				<header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-bg/90 px-4 backdrop-blur-xl sm:px-6">
					<IconButton
						aria-label="Open navigation"
						variant="outline"
						color="neutral"
						size="36"
						className="lg:hidden"
						onClick={() => setIsMobileOpen(true)}>
						<Menu />
					</IconButton>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" color="neutral" size="36" className="max-w-56">
								<span className="size-2 shrink-0 rounded-full bg-success" />
								<span className="truncate">{workspace}</span>
								<ChevronDown className="ml-auto" aria-hidden="true" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="start" className="w-64">
							<DropdownMenuLabel>Workspaces</DropdownMenuLabel>
							<DropdownMenuRadioGroup value={workspace} onValueChange={setWorkspace}>
								{workspaces.map((item) => (
									<DropdownMenuRadioItem key={item} value={item}>
										<Radio />
										{item}
									</DropdownMenuRadioItem>
								))}
							</DropdownMenuRadioGroup>
							<DropdownMenuDivider />
							<DropdownMenuItem>
								<Plus />
								Create workspace
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

					<div className="ml-auto flex items-center gap-2">
						<Button asChild variant="ghost" color="neutral" size="36" className="hidden sm:inline-flex">
							<Link href="/docs">
								<BookOpen />
								Docs
							</Link>
						</Button>
						<ThemeToggler />
						<div
							className="flex size-9 items-center justify-center rounded-lg border border-border bg-fill2 text-xs font-semibold"
							aria-label="Signed in user">
							AP
						</div>
					</div>
				</header>

				<main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
					<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<div className="mb-2 flex items-center gap-2 text-sm text-fg-secondary">
								<span className="size-2 rounded-full bg-success" />
								All systems operational
							</div>
							<h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard</h1>
							<p className="mt-1 max-w-2xl text-sm text-fg-secondary">
								Monitor request health, latency, and errors across your services.
							</p>
						</div>
						<Button asChild variant="outline" color="neutral" size="36">
							<Link href="#log-search">
								<Search />
								Search logs
								<span className="ml-2 hidden rounded border border-border bg-fill2 px-1.5 py-0.5 font-mono text-[10px] text-fg-tertiary sm:inline">
									⌘ K
								</span>
							</Link>
						</Button>
					</div>

				</main>
			</div>
		</div>
	)
}
