type SessionUser = {
  id: string
  name: string | null
  email: string
}

type ResolveSessionUserInput = {
  currentUser: SessionUser | null
  currentVersion: number
  fetchedUser: SessionUser | null
  snapshotVersion: number
}

export function resolveSessionUser({
  currentUser,
  currentVersion,
  fetchedUser,
  snapshotVersion,
}: ResolveSessionUserInput) {
  if (currentVersion !== snapshotVersion) {
    return currentUser
  }

  return fetchedUser
}
