import { requireRole } from "@/lib/supabase/guards";

export default async function BusinessDashboardLayout({ children }: { children: React.ReactNode }) {
  await requireRole("business", "/dashboard/business");
  return children;
}
