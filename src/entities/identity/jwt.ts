import type { User, UserRole } from "./types";

export function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload) as Record<string, unknown>;
  } catch {
    try {
      const base64Url = token.split(".")[1];
      if (!base64Url) return null;
      let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      while (base64.length % 4 !== 0) {
        base64 += "=";
      }
      return JSON.parse(atob(base64)) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}

export function parseUserFromToken(
  accessToken: string,
  defaultEmail?: string,
  fullName?: string | null,
): User {
  const payload = parseJwtPayload(accessToken);
  const email = (payload?.["email"] as string) || defaultEmail || "";
  const userId = (payload?.["userId"] as string) || (payload?.["sub"] as string) || email;
  const roleRaw =
    payload?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
    payload?.["role"] ||
    payload?.["Role"] ||
    "Customer";

  const role: UserRole = String(roleRaw).toLowerCase() === "admin" ? "Admin" : "Customer";

  return {
    userId,
    email,
    fullName: fullName || (payload?.["fullName"] as string) || (email ? email.split("@")[0] || "User" : "User"),
    phone: null,
    avatarUrl: null,
    role,
    isEmailVerified: true,
  };
}
