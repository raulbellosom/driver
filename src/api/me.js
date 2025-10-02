import { getSessionUser, getMemberships } from "../lib/appwrite";

export async function fetchMe() {
  const user = await getSessionUser();
  const memberships = await getMemberships();
  return {
    user,
    memberships,
    teams: memberships.map((m) => ({ id: m.teamId, name: m.teamName })),
  };
}
