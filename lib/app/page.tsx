import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { LandingHero } from "@/components/landing-hero"

export default function Home() {
  const cookieStore = cookies()
  const session = cookieStore.get("session")

  // If user is logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <LandingHero />
    </main>
  )
}
