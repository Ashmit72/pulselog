"use client"

import { useSyncExternalStore } from "react"
import { Loader2, MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { IconButton } from "@/components/ui/button"

const emptySubscribe = () => () => undefined

export function ThemeToggler() {
	const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)
	const { resolvedTheme, setTheme } = useTheme()

	const toggleTheme = () => {
		setTheme(resolvedTheme === "light" ? "dark" : "light")
	}

	if (!mounted) {
		return (
			<IconButton aria-label="Loading color theme" variant="outline" color="neutral" disabled>
				<Loader2 className="size-5 animate-spin" />
			</IconButton>
		)
	}

	return (
		<IconButton
			aria-label={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} theme`}
			title={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} theme`}
			variant="outline"
			color="neutral"
			onClick={toggleTheme}>
			{resolvedTheme === "light" ? <MoonIcon /> : <SunIcon />}
		</IconButton>
	)
}
