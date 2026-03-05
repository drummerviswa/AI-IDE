import AddNewButton from "@/features/dashboard/components/add-new-btn";
import AddRepo from "@/features/dashboard/components/add-repo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAllPlaygroundForUser } from "@/features/playground/actions";
import Link from "next/link";

const DashboardMainPage = async () => {
  const playgrounds = (await getAllPlaygroundForUser()) || [];
  const totalPlaygrounds = playgrounds.length;
  const starredCount = playgrounds.filter((item) => item.Starmark?.[0]?.isMarked).length;
  const templateCount = new Set(playgrounds.map((item) => item.template)).size;
  const recentPlaygrounds = [...playgrounds]
    .sort(
      (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    )
    .slice(0, 6);

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-start px-4 py-10">
      <div className="mb-6 w-full">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Quick actions and recent activity. Use the Playgrounds page for full project management.
        </p>
      </div>

      <div className="mb-6 grid w-full grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Playgrounds</CardDescription>
            <CardTitle className="text-2xl">{totalPlaygrounds}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Starred</CardDescription>
            <CardTitle className="text-2xl">{starredCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Templates Used</CardDescription>
            <CardTitle className="text-2xl">{templateCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
        <AddNewButton />
        <AddRepo />
      </div>

      <div className="mt-10 w-full">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Playgrounds</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/playgrounds">Open All Playgrounds</Link>
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            {recentPlaygrounds.length === 0 ? (
              <p className="text-sm text-muted-foreground">No playgrounds yet. Create your first one above.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {recentPlaygrounds.map((playground) => (
                  <Link
                    key={playground.id}
                    href={`/playground/${playground.id}`}
                    className="flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-muted/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{playground.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {playground.description || "No description"}
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-2 shrink-0">
                      {playground.template}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardMainPage;
