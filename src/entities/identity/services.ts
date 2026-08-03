import { mock, request } from "@/core/lib/api-client";
import { useMockData } from "@/core/config/env";
import type { Credentials, LoginResponse, RegisterPayload, RegisterResponse, UserAddress } from "./types";

export const MOCK_ADDRESSES: UserAddress[] = [
  {
    addressId: "a1",
    userId: "u1",
    receiverName: "Khách Hàng Demo",
    phoneNumber: "0901234567",
    addressLine1: "12 Nguyễn Huệ",
    ward: "Bến Nghé",
    district: "Quận 1",
    city: "TP. Hồ Chí Minh",
    isDefault: true,
    addressType: "Home",
  },
];

export async function login(credentials: Credentials): Promise<LoginResponse> {
  if (!useMockData) return request<LoginResponse>("/api/auth/login", { method: "POST", body: credentials });
  if (credentials.password.length < 6) throw new Error("Mật khẩu tối thiểu 6 ký tự");
  return mock({ accessToken: "demo-access-token", refreshToken: "demo-refresh-token" }, 400);
}

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  if (!useMockData) return request<RegisterResponse>("/api/auth/register", { method: "POST", body: payload });
  if (payload.password.length < 6) throw new Error("Mật khẩu tối thiểu 6 ký tự");
  return mock(
    {
      userId: "demo-user",
      email: payload.email,
      fullName: payload.fullName,
      role: "Customer",
      createdAt: new Date().toISOString(),
    },
    400,
  );
}

export async function getAddresses(): Promise<UserAddress[]> {
  return mock(MOCK_ADDRESSES);
}
