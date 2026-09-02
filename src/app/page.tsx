import type { Metadata } from "next";

import { DocumentationHome } from "@/components/documentation-home";

export const metadata: Metadata = {
  title: "Developer-first API observability",
  description:
    "PulseLog captures structured request events, visualizes latency and errors, and provides a searchable multi-tenant log explorer.",
};

export default function HomePage() {
  return <DocumentationHome />;
}
