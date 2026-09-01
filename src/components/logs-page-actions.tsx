"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LogsPageActions() {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();

  function refreshLogs() {
    startRefresh(() => router.refresh());
  }

  return (
    <>
      <Badge variant="soft" color="neutral" size="28">
        Database logs
      </Badge>
      <Button
        variant="outline"
        color="neutral"
        size="36"
        onClick={refreshLogs}
        disabled={refreshing}
      >
        <RefreshCw className={cn(refreshing && "animate-spin")} />
        {refreshing ? "Refreshing" : "Refresh"}
      </Button>
    </>
  );
}
