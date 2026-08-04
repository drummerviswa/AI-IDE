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
import { formatDistanceToNow } from "date-fns";
import { Code2, FolderOpen, Star, Layers } from "lucide-react";
import Link from "next/link";

const templateColors: Record<string, string> = {
  REACT: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
  NEXTJS: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/30",
  VUE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  EXPRESS: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
  HONO: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30",
  ANGULAR: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
};

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
      <div className="mb-8 w-full">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage your playgrounds and quick-start new projects.
        </p>
      </div>

      {/* Stats row */}
      <div className="mb-8 grid w-full grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription>Total Playgrounds</CardDescription>
            <Code2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-3xl font-bold">{totalPlaygrounds}</CardTitle>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription>Starred</CardDescription>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-3xl font-bold">{starredCount}</CardTitle>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription>Templates Used</CardDescription>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-3xl font-bold">{templateCount}</CardTitle>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
        <AddNewButton />
        <AddRepo />
      </div>

      {/* Recent Playgrounds */}
      <div className="mt-10 w-full">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Playgrounds</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/playgrounds">View All</Link>
          </Button>
        </div>

        {recentPlaygrounds.length === 0 ? (
          /* Empty state */
          <Card>
            <CardContent className="pt-12 pb-12 flex flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <FolderOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-lg">No playgrounds yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your first playground to start coding in the browser
                </p>
              </div>
              <Button asChild variant="default" className="mt-2">
                <Link href="/playgrounds">Create a Playground</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {recentPlaygrounds.map((playground) => (
              <Link
                key={playground.id}
                href={`/playground/${playground.id}`}
                className="group flex flex-col gap-3 rounded-xl border border-border/60 bg-card/60 p-4 transition-all duration-200 hover:bg-card hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium truncate group-hover:text-primary transition-colors">
                    {playground.title}
                  </p>
                  <Badge
                    variant="outline"
                    className={`text-xs shrink-0 ${templateColors[playground.template] || ""}`}
                  >
                    {playground.template}
                  </Badge>
                </div>

                {playground.description && (
                  <p className="text-xs text-muted-foreground truncate">
                    {playground.description}
                  </p>
                )}

                <p className="text-xs text-muted-foreground mt-auto">
                  {formatDistanceToNow(new Date(playground.createdAt), { addSuffix: true })}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardMainPage;
