import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardTabs } from "@/components/dashboard-tabs"
import { getUserData } from "@/lib/auth-actions"

export default async function DashboardPage() {
  const cookieStore = cookies()
  const session = cookieStore.get("session")

  if (!session) {
    redirect("/login")
  }

  const userData = await getUserData()

  if (!userData) {
    // Handle invalid session
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader username={userData.username} />
      <main className="flex-1 container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">Your Secure Dashboard</h1>
        <DashboardTabs />
      </main>
    </div>
  )
}
