import { mock, request } from "@/core/lib/api-client";
import { useMockData } from "@/core/config/env";
import type { Credentials, RegisterPayload, User, UserAddress } from "./types";

const DEMO_USER: User = {
  userId: "u1",
  email: "demo@gymkitten.com",
  fullName: "Khách Hàng Demo",
  phone: "0901234567",
  avatarUrl: null,
  role: "Customer",
  isEmailVerified: true,
};

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

export async function login(credentials: Credentials): Promise<User> {
  if (!useMockData) return request<User>("/identity/login", { method: "POST", body: credentials });
  if (credentials.password.length < 6) throw new Error("Mật khẩu tối thiểu 6 ký tự");
  return mock({ ...DEMO_USER, email: credentials.email }, 400);
}

export async function register(payload: RegisterPayload): Promise<User> {
  if (!useMockData) return request<User>("/identity/register", { method: "POST", body: payload });
  if (payload.password.length < 6) throw new Error("Mật khẩu tối thiểu 6 ký tự");
  return mock({ ...DEMO_USER, email: payload.email, fullName: payload.fullName }, 400);
}

export async function getAddresses(): Promise<UserAddress[]> {
  if (useMockData) return mock(MOCK_ADDRESSES);
  return request<UserAddress[]>("/identity/addresses");
}
