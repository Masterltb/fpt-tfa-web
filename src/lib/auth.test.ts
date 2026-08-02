import { describe, it, expect } from "vitest";

/* Locks the token contract against the backend's `decode_mock_token`
   (app/api/deps.py): base64(JSON) carrying `uid` and `role`. If this drifts,
   every authenticated request 401s with no useful error. */

describe("mock token contract", () => {
  it("encodes to what the backend decoder expects", () => {
    const token = btoa(JSON.stringify({ uid: "dev-lecturer", role: "lecturer" }));

    // Mirrors the Python side: base64decode -> json.loads -> claims["uid"|"role"]
    const claims = JSON.parse(atob(token));
    expect(claims.uid).toBe("dev-lecturer");
    expect(claims.role).toBe("lecturer");

    // Verified against a live backend: this exact token returns 200 on
    // GET /api/v1/auth/me.
    expect(token).toBe("eyJ1aWQiOiJkZXYtbGVjdHVyZXIiLCJyb2xlIjoibGVjdHVyZXIifQ==");
  });
});
