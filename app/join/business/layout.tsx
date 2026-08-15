import { requireRole } from "@/lib/supabase/guards";

export default async function BusinessOnboardingLayout({ children }: { children: React.ReactNode }) {
  await requireRole("business", "/join/business");
  return children;
}
