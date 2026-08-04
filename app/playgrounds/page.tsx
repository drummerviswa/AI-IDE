import AddNewButton from "@/features/dashboard/components/add-new-btn";
import AddRepo from "@/features/dashboard/components/add-repo";
import ProjectTable from "@/features/dashboard/components/project-table";
import Image from "next/image";
import { getAllPlaygroundForUser } from "@/features/playground/actions";

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16">
    <Image src="/empty-state.svg" alt="No projects" width={192} height={192} className="mb-4 h-48 w-48" />
    <h2 className="text-xl font-semibold text-foreground">No playgrounds found</h2>
    <p className="text-muted-foreground">Create a new playground to get started!</p>
  </div>
);

const PlaygroundsPage = async () => {
  const playgrounds = await getAllPlaygroundForUser();

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-start px-4 py-10">
      <div className="mb-6 w-full">
        <h1 className="text-2xl font-semibold tracking-tight">All Playgrounds</h1>
        <p className="text-muted-foreground">Browse, manage, and open all your playground projects.</p>
      </div>

      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
        <AddNewButton />
        <AddRepo />
      </div>

      <div className="mt-10 flex w-full flex-col items-center justify-center">
        {playgrounds && playgrounds.length === 0 ? (
          <EmptyState />
        ) : (
          <ProjectTable
            projects={(playgrounds || []).map((p) => ({
              ...p,
              description: p.description || "",
              user: {
                ...p.user,
                name: p.user?.name || "",
                image: p.user?.image || "",
                role: p.user?.role || "USER",
              },
            }))}
          />
        )}
      </div>
    </div>
  );
};

export default PlaygroundsPage;
