import { createFileRoute } from "@tanstack/react-router";
import { SmartSchedulerPage } from "@/components/dashboard/SmartSchedulerPage";

export const Route = createFileRoute("/dashboard/scheduler")({
  head: () => ({ meta: [{ title: "Smart Scheduler — Nexora AI" }] }),
  component: SmartSchedulerPage,
});
