import { requireRole } from "@/lib/supabase/guards";

export default async function CreatorDashboardLayout({ children }: { children: React.ReactNode }) {
  await requireRole("creator", "/dashboard/creator");
  return children;
}
