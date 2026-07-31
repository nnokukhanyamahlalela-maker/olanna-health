/**
 * Tests for partnerTokenAuth middleware error handling.
 *
 * Verifies that when the database throws during token lookup, the middleware
 * returns a clean 503 JSON response instead of propagating an unhandled error.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

// ---------------------------------------------------------------------------
// Use vi.hoisted so the mock variables are available when vi.mock is hoisted.
// ---------------------------------------------------------------------------
const { mockLimit, mockWhere, mockFrom, mockSelect } = vi.hoisted(() => {
  const mockLimit = vi.fn();
  const mockWhere = vi.fn(() => ({ limit: mockLimit }));
  const mockFrom = vi.fn(() => ({ where: mockWhere }));
  const mockSelect = vi.fn(() => ({ from: mockFrom }));
  return { mockLimit, mockWhere, mockFrom, mockSelect };
});

vi.mock("../db", () => ({
  db: { select: mockSelect },
}));

// Import middleware AFTER mock is set up.
import { partnerTokenAuth } from "../middleware/partnerAuth";

// ---------------------------------------------------------------------------
// Helpers to build minimal mock req/res/next objects.
// ---------------------------------------------------------------------------
function makeReq(token?: string): Partial<Request> {
  return {
    header: (name: string) =>
      (name === "x-partner-token" ? token : undefined) as any,
  };
}

function makeRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("partnerTokenAuth middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ limit: mockLimit });
  });

  it("returns 401 when no token is provided", async () => {
    const req = makeReq(undefined);
    const res = makeRes();
    const next = vi.fn();

    await partnerTokenAuth(req as Request, res as Response, next as NextFunction);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when token is too short", async () => {
    const req = makeReq("tooshort");
    const res = makeRes();
    const next = vi.fn();

    await partnerTokenAuth(req as Request, res as Response, next as NextFunction);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 503 JSON (not an unhandled crash) when the database throws", async () => {
    const dbError = Object.assign(new Error("Connection refused"), {
      code: "ECONNREFUSED",
    });
    mockLimit.mockRejectedValue(dbError);

    const req = makeReq("a-valid-looking-partner-token-1234");
    const res = makeRes();
    const next = vi.fn();

    await partnerTokenAuth(req as Request, res as Response, next as NextFunction);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 403 when the token is not found in the database", async () => {
    mockLimit.mockResolvedValue([]); // no matching link

    const req = makeReq("a-valid-looking-partner-token-1234");
    const res = makeRes();
    const next = vi.fn();

    await partnerTokenAuth(req as Request, res as Response, next as NextFunction);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next() and attaches partnerLink when a valid token is found", async () => {
    const fakeLink = {
      id: 1,
      partnerToken: "a-valid-looking-partner-token-1234",
      isActive: true,
    };
    mockLimit.mockResolvedValue([fakeLink]);

    const req = makeReq("a-valid-looking-partner-token-1234") as any;
    const res = makeRes();
    const next = vi.fn();

    await partnerTokenAuth(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalled();
    expect(req.partnerLink).toEqual(fakeLink);
    expect(res.status).not.toHaveBeenCalled();
  });
});
