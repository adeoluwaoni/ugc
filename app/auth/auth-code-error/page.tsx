import Link from "next/link";

export default function AuthCodeErrorPage() {
  return <main className="auth-error-page"><span className="radar-logo"><span /></span><h1>We couldn&apos;t complete sign-in.</h1><p>The authentication link may have expired or the provider is not fully configured.</p><Link href="/auth?mode=signin">Return to sign in</Link></main>;
}
