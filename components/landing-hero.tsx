import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, Lock, Database } from "lucide-react"

export function LandingHero() {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen px-4 py-12 text-center bg-gradient-to-b from-background to-muted">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex justify-center mb-6">
          <div className="p-3 rounded-full bg-primary/10">
            <Shield className="w-12 h-12 text-primary" />
          </div>
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">Secure Data Storage System</h1>

        <p className="text-xl text-muted-foreground">
          Store your sensitive data with military-grade encryption. Access your data anywhere with the correct passkey.
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-3xl mx-auto">
          <div className="flex flex-col items-center p-6 space-y-4 bg-card rounded-lg shadow-sm">
            <Lock className="w-10 h-10 text-primary" />
            <h3 className="text-xl font-medium">Passkey Protection</h3>
            <p className="text-sm text-muted-foreground">Your data is encrypted with your unique passkey</p>
          </div>

          <div className="flex flex-col items-center p-6 space-y-4 bg-card rounded-lg shadow-sm">
            <Database className="w-10 h-10 text-primary" />
            <h3 className="text-xl font-medium">In-Memory Storage</h3>
            <p className="text-sm text-muted-foreground">No external databases, all data stored securely in memory</p>
          </div>

          <div className="flex flex-col items-center p-6 space-y-4 bg-card rounded-lg shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-10 h-10 text-primary"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              <path d="M9.1 12a2.1 2.1 0 0 1 0-4.2" />
              <path d="M14.9 12a2.1 2.1 0 0 0 0-4.2" />
              <path d="M12 12v2.1" />
            </svg>
            <h3 className="text-xl font-medium">Import & Export</h3>
            <p className="text-sm text-muted-foreground">Securely import and export your encrypted data</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button asChild size="lg">
            <Link href="/register">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
