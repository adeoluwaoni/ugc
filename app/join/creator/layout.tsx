import { requireRole } from "@/lib/supabase/guards";

export default async function CreatorOnboardingLayout({ children }: { children: React.ReactNode }) {
  await requireRole("creator", "/join/creator");
  return children;
}
