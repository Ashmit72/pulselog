"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  BookOpen,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  CircleGauge,
  KeyRound,
  LogOut,
  Menu,
  Plus,
  Radio,
  Settings,
  TerminalSquare,
  X,
} from "lucide-react";

import Logo from "@/components/Logo";
import { ThemeToggler } from "@/components/theme-toggler";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarStatus,
} from "@/components/ui/avatar";
import { Badge, BadgeDot } from "@/components/ui/badge";
import { Button, IconButton } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuDivider,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type WorkspaceSummary = {
  id: string;
  name: string;
};

type UserSummary = {
  name: string;
  email: string;
  image?: string | null;
};

const navigation = [
  { label: "Overview", segment: "", icon: CircleGauge },
  { label: "Logs", segment: "/logs", icon: TerminalSquare },
  { label: "API Keys", segment: "/api-keys", icon: KeyRound },
  { label: "Settings", segment: "/settings", icon: Settings },
];

function getInitials(name: string, email: string) {
  const source = name.trim() || email.split("@")[0];
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function UserAvatar({
  user,
  size,
}: {
  user: UserSummary;
  size: "36" | "48";
}) {
  const initials = getInitials(user.name, user.email);

  return (
    <Avatar size={size} className="shrink-0">
      {user.image ? (
        <AvatarImage
          src={user.image}
          alt={`${user.name || "User"} profile picture`}
          referrerPolicy="no-referrer"
        />
      ) : null}
      <AvatarFallback color="violet-blue" delayMs={250}>
        {initials}
      </AvatarFallback>
      <AvatarStatus variant="online" aria-label="Online" />
    </Avatar>
  );
}

function UserProfilePopover({
  user,
  collapsed,
}: {
  user: UserSummary;
  collapsed: boolean;
}) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      const result = await authClient.signOut();

      if (result.error) {
        toast.error(result.error.message ?? "Could not log out");
        return;
      }

      router.replace("/signin");
      router.refresh();
    } catch {
      toast.error("Could not log out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          color="neutral"
          className={cn(
            "h-auto w-full justify-start gap-3 px-2 py-2 text-left",
            collapsed && "lg:justify-center lg:px-0",
          )}
          aria-label={`Open profile menu for ${user.email}`}
        >
          <UserAvatar user={user} size="36" />
          <span className={cn("min-w-0 flex-1", collapsed && "lg:hidden")}>
            <span className="block truncate text-sm font-medium text-fg">
              {user.name || "PulseLog user"}
            </span>
            <span className="block truncate text-xs font-normal text-fg-tertiary">
              {user.email}
            </span>
          </span>
          <ChevronDown
            className={cn("size-4 shrink-0 text-fg-tertiary", collapsed && "lg:hidden")}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="end"
        sideOffset={10}
        className="w-[min(20rem,calc(100vw-2rem))] rounded-xl p-0"
      >
        <div className="flex items-center gap-3 p-4">
          <UserAvatar user={user} size="48" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <Badge size="20" variant="soft" color="primary">
                Owner
              </Badge>
            </div>
            <p className="mt-0.5 truncate text-xs text-fg-secondary">{user.email}</p>
          </div>
        </div>
        <div className="border-t border-border p-2">
          <Button
            variant="ghost"
            color="error"
            size="36"
            className="w-full justify-start"
            onClick={handleSignOut}
            loading={isSigningOut}
            disabled={isSigningOut}
          >
            <LogOut />
            Log out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function WorkspaceShell({
  user,
  workspaces,
  currentWorkspace,
  children,
}: {
  user: UserSummary;
  workspaces: WorkspaceSummary[];
  currentWorkspace: WorkspaceSummary;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const workspaceRoot = `/${currentWorkspace.id}`;

  return (
    <div className="min-h-svh bg-bg">
      {isMobileOpen ? (
        <Button
          aria-label="Close navigation"
          variant="ghost"
          color="neutral"
          className="fixed inset-0 z-30 h-auto w-full rounded-none bg-black-inverse/35 p-0 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        >
          <span className="sr-only">Close navigation</span>
        </Button>
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-elevation-level1 transition-[width,transform] duration-200",
          isCollapsed && "lg:w-[4.5rem]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-4">
          <Logo width={34} height={34} />
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
            onClick={() => setIsMobileOpen(false)}
          >
            <X />
          </IconButton>
        </div>

        <div className="border-b border-border p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                color="neutral"
                size="40"
                className={cn(
                  "w-full justify-start px-2.5",
                  isCollapsed && "lg:justify-center lg:px-0",
                )}
                title={isCollapsed ? currentWorkspace.name : undefined}
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary-accent text-xs font-semibold text-primary-text">
                  {currentWorkspace.name.charAt(0).toUpperCase()}
                </span>
                <span className={cn("min-w-0 flex-1 truncate text-left", isCollapsed && "lg:hidden")}>
                  {currentWorkspace.name}
                </span>
                <ChevronDown className={cn("ml-auto", isCollapsed && "lg:hidden")} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={currentWorkspace.id}
                onValueChange={(id) => router.push(`/${id}`)}
              >
                {workspaces.map((item) => (
                  <DropdownMenuRadioItem key={item.id} value={item.id}>
                    <Radio />
                    <span className="truncate">{item.name}</span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuDivider />
              <DropdownMenuItem onSelect={() => router.push("/onboarding?new=1")}>
                <Plus />
                Create new workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Workspace navigation">
          {navigation.map((item) => {
            const href = `${workspaceRoot}${item.segment}`;
            const isActive = item.segment
              ? pathname.startsWith(href)
              : pathname === workspaceRoot;
            const Icon = item.icon;

            return (
              <Button
                key={item.label}
                asChild
                variant={isActive ? "soft" : "ghost"}
                color={isActive ? "primary" : "neutral"}
                size="40"
                className={cn(
                  "w-full justify-start px-3",
                  isCollapsed && "lg:justify-center lg:px-0",
                )}
              >
                <Link
                  href={href}
                  title={isCollapsed ? item.label : undefined}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <Icon />
                  <span className={cn(isCollapsed && "lg:sr-only")}>{item.label}</span>
                </Link>
              </Button>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <UserProfilePopover user={user} collapsed={isCollapsed} />
          <Button
            variant="ghost"
            color="neutral"
            size="36"
            className={cn(
              "mt-1 hidden w-full justify-start px-3 lg:inline-flex",
              isCollapsed && "lg:justify-center lg:px-0",
            )}
            onClick={() => setIsCollapsed((value) => !value)}
          >
            {isCollapsed ? <ChevronsRight /> : <ChevronsLeft />}
            <span className={cn(isCollapsed && "lg:sr-only")}>Collapse sidebar</span>
          </Button>
        </div>
      </aside>

      <div
        className={cn(
          "min-h-svh transition-[padding] duration-200 lg:pl-64",
          isCollapsed && "lg:pl-[4.5rem]",
        )}
      >
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-bg/90 px-4 backdrop-blur-xl sm:px-6">
          <IconButton
            aria-label="Open navigation"
            variant="outline"
            color="neutral"
            size="36"
            className="lg:hidden"
            onClick={() => setIsMobileOpen(true)}
          >
            <Menu />
          </IconButton>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{currentWorkspace.name}</p>
            <p className="hidden text-xs text-fg-tertiary sm:block">Production workspace</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="soft" color="success" className="hidden sm:inline-flex">
              <BadgeDot />
              Ingest healthy
            </Badge>
            <Button asChild variant="ghost" color="neutral" size="36" className="hidden md:inline-flex">
              <Link href="/docs">
                <BookOpen />
                Docs
              </Link>
            </Button>
            <ThemeToggler />
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
