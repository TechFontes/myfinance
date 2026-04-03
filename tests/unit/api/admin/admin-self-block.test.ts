import { beforeEach, describe, expect, it, vi } from "vitest"

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const adminMock = vi.hoisted(() => ({
  blockUserForAdmin: vi.fn(),
}))

vi.mock("@/lib/auth", () => authMock)
vi.mock("@/modules/admin/service", () => adminMock)

import { POST as blockUserPOST } from "@/api/admin/users/[userId]/block/route"

describe("admin self-block prevention", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns 400 when admin tries to block themselves", async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: "admin-1", role: "ADMIN" })

    const response = await blockUserPOST(
      new Request("http://localhost/api/admin/users/admin-1/block", {
        method: "POST",
        body: JSON.stringify({ reason: "testing" }),
      }) as never,
      { params: Promise.resolve({ userId: "admin-1" }) },
    )

    expect(response).toBeDefined()
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: "Cannot block your own account" })
    expect(adminMock.blockUserForAdmin).not.toHaveBeenCalled()
  })

  it("allows admin to block a different user", async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: "admin-1", role: "ADMIN" })
    adminMock.blockUserForAdmin.mockResolvedValue({
      id: "user-2",
      blockedReason: "policy violation",
    })

    const response = await blockUserPOST(
      new Request("http://localhost/api/admin/users/user-2/block", {
        method: "POST",
        body: JSON.stringify({ reason: "policy violation" }),
      }) as never,
      { params: Promise.resolve({ userId: "user-2" }) },
    )

    expect(response).toBeDefined()
    expect(response.status).toBe(200)
    expect(adminMock.blockUserForAdmin).toHaveBeenCalledWith("user-2", "policy violation")
  })
})
