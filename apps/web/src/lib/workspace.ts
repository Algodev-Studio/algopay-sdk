import { prisma } from "./prisma";

export async function getDefaultWorkspace(userId: string) {
  const ws = await prisma.workspace.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  return ws;
}

export async function requireWorkspace(userId: string) {
  const ws = await getDefaultWorkspace(userId);
  if (!ws) throw new Error("no_workspace");
  return ws;
}
