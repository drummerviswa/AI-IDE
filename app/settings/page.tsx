import { auth } from "@/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { redirect } from "next/navigation"
import Link from "next/link";

export const dynamic = "force-dynamic";



export default async function SettingsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/sign-in")
  }

  const initials =
    session.user.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"

  return (
    <div className="mx-auto w-full max-w-3xl p-6 md:p-8">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:underline">
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile and account details.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex items-start gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={session.user.image ?? ""} alt={session.user.name ?? "User"} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{session.user.name || "Not provided"}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{session.user.email || "Not provided"}</p>
            </div>

            {session.user.role && <Badge variant="secondary">Role: {session.user.role}</Badge>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
