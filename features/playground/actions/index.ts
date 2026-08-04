"use server"
import { currentUser } from "@/features/auth/actions";
import { db } from "@/lib/db"
import { TemplateFolder } from "../libs/path-to-json";
import { revalidatePath } from "next/cache";
import { importGitHubRepository, type PlaygroundTemplate } from "../libs/github-import";


// Toggle marked status for a playground
export const toggleStarMarked = async (playgroundId: string, isChecked: boolean) => {
    const user = await currentUser();
    const userId = user?.id;
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    if (isChecked) {
      await db.starMark.create({
        data: {
          userId: userId!,
          playgroundId,
          isMarked: isChecked,
        },
      });
    } else {
      await db.starMark.delete({
        where: {
          userId_playgroundId: {
            userId,
            playgroundId: playgroundId,
          },
        },
      });
    }

    revalidatePath("/dashboard");
    return { success: true, isMarked: isChecked };
  } catch (error) {
    console.error("Error updating star mark:", error);
    return { success: false, error: "Failed to update star mark" };
  }
};

export const createPlayground = async (data:{
    title: string;
  template: PlaygroundTemplate;
    description?: string;
  })=>{
    const {template , title , description} = data;

    const user = await currentUser();
    try {
        const playground = await db.playground.create({
            data:{
                title:title,
                description:description,
                template:template,
                userId:user?.id!
            }
        })

        return playground;
    } catch (error) {
        console.error("Error creating playground:", error);
    }
}

export const importPlaygroundFromGitHub = async (data: {
  repository: string;
  branch?: string;
  accessToken?: string;
}) => {
  const user = await currentUser();
  if (!user?.id) {
    throw new Error("You must be logged in to import repositories");
  }

  const imported = await importGitHubRepository(data.repository, data.branch, data.accessToken);

  try {
    const createdPlayground = await db.playground.create({
      data: {
        title: imported.title,
        description: `${imported.description} • ${imported.sourceRepo}@${imported.sourceBranch}`,
        template: imported.template,
        userId: user.id,
        templateFiles: {
          create: {
            content: JSON.stringify(imported.templateData),
          },
        },
      },
      include: {
        templateFiles: true,
      },
    });

    revalidatePath("/dashboard");
    return {
      ...createdPlayground,
      importedFileCount: imported.importedFileCount,
      sourceRepo: imported.sourceRepo,
      sourceBranch: imported.sourceBranch,
    };
  } catch (error) {
    console.error("Error importing GitHub repository:", error);
    throw new Error("Failed to create imported playground");
  }
};


export const getAllPlaygroundForUser = async ()=>{
    try {
        const user = await currentUser();
        const playground = await db.playground.findMany({
            where:{
                userId:user?.id!
            },
            include:{
                user:true,
                Starmark:{
                    where:{
                        userId:user?.id!
                    },
                    select:{
                        isMarked:true
                    }
                }
            }
        })
      
        return playground;
    } catch (error) {
        console.error("Error fetching playgrounds:", error);
    }
}

export const getPlaygroundById = async (id:string)=>{
    try {
        const playground = await db.playground.findUnique({
            where:{id},
            select:{
              templateFiles:{
                select:{
                  content:true
                }
              }
            }
        })
        return playground;
    } catch (error) {
        console.error("Error fetching playground by id:", error);
    }
}

export const getPublicPlaygroundById = async (id: string) => {
  try {
    const playground = await db.playground.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        template: true,
        isPublic: true,
        templateFiles: {
          select: {
            content: true,
          },
        },
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });
    return playground;
  } catch (error) {
    console.error("Error fetching public playground:", error);
    return null;
  }
};

export const togglePlaygroundPublic = async (id: string, isPublic: boolean) => {
  const user = await currentUser();
  if (!user?.id) throw new Error("Unauthorized");

  try {
    const playground = await db.playground.update({
      where: { id, userId: user.id },
      data: { isPublic },
    });
    revalidatePath(`/playground/${id}`);
    return { success: true, isPublic: playground.isPublic };
  } catch (error) {
    console.error("Error toggling playground public status:", error);
    return { success: false };
  }
};

export const SaveUpdatedCode = async (playgroundId: string, data: TemplateFolder) => {
  const user = await currentUser();
  if (!user) return null;

  try {
    const updatedPlayground = await db.templateFile.upsert({
      where: {
        playgroundId,
      },
      update: {
        content: JSON.stringify(data),
      },
      create: {
        playgroundId,
        content: JSON.stringify(data),
      },
    });

    return updatedPlayground;
  } catch (error) {
    console.error("SaveUpdatedCode error:", error);
    return null;
  }
};

export const deleteProjectById = async (id:string)=>{
    try {
        await db.playground.delete({
            where:{id}
        })
        revalidatePath("/dashboard")
    } catch (error) {
        console.error("Error deleting playground:", error);
    }
}


export const editProjectById = async (id:string,data:{title:string , description:string})=>{
    try {
        await db.playground.update({
            where:{id},
            data:data
        })
        revalidatePath("/dashboard")
    } catch (error) {
        console.error("Error editing playground:", error);
    }
}

export const duplicateProjectById = async (id: string) => {
    try {
        const originalPlayground = await db.playground.findUnique({
            where: { id },
            include: {
                templateFiles: true,
            },
        });

        if (!originalPlayground) {
            throw new Error("Original playground not found");
        }

        const duplicatedPlayground = await db.playground.create({
            data: {
                title: `${originalPlayground.title} (Copy)`,
                description: originalPlayground.description,
                template: originalPlayground.template,
                userId: originalPlayground.userId,
                templateFiles: {
                    create: originalPlayground.templateFiles.map((file) => ({
                        content: file.content as Parameters<typeof db.templateFile.create>[0]["data"]["content"],
                    })),
                },
            },
        });

        revalidatePath("/dashboard");

        return duplicatedPlayground;
    } catch (error) {
        console.error("Error duplicating project:", error);
    }
};