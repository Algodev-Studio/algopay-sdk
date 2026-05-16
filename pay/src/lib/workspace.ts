import { prisma } from "./prisma";
import { getSessionUserId } from "./session";

export { prisma };

export async function getWorkspace() {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const workspace = await prisma.workspace.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return workspace;
}

export async function requireWorkspace() {
  const workspace = await getWorkspace();
  if (!workspace) throw new Error("Unauthorized");
  return workspace;
}
