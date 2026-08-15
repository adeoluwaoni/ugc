import { AuthForm } from "./auth-form";
import type { AccountRole } from "@/lib/account";

type AuthPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = await searchParams;
  const role: AccountRole = params.role === "creator" ? "creator" : "business";
  const mode = params.mode === "signin" ? "signin" : "signup";
  const rawNext = typeof params.next === "string" ? params.next : "";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : role === "creator" ? "/join/creator" : "/join/business";
  const error = typeof params.error === "string" ? params.error : "";
  return <AuthForm initialMode={mode} initialRole={role} next={next} initialError={error} />;
}
