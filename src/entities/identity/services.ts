import { mock, request } from "@/core/lib/api-client";
import { useMockData } from "@/core/config/env";
import type {
  Credentials,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  VerifyEmailRequest,
  ResendOtpRequest,
  ForgotPasswordRequest,
  ChangePasswordRequest,
  UserAddress,
  CreateAddressPayload,
  UpdateAddressPayload,
} from "./types";

export const MOCK_ADDRESSES: UserAddress[] = [
  {
    addressId: "a1000000-0000-0000-0000-000000000001",
    userId: "u1",
    receiverName: "Nguyen Van A",
    phoneNumber: "0901234567",
    addressLine1: "123 Le Loi",
    ward: "Phường Bến Nghé",
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
    400
  );
}

/**
 * Client API 2.1: Lấy Danh Sách Địa Chỉ Của Tôi (GET /api/user/addresses)
 */
export async function getAddresses(): Promise<UserAddress[]> {
  return getMyAddressesApi();
}

export async function getMyAddressesApi(): Promise<UserAddress[]> {
  if (useMockData) {
    return mock(MOCK_ADDRESSES);
  }

  const res = await request<UserAddress[] | { items: UserAddress[] }>("/api/user/addresses");
  if (Array.isArray(res)) return res;
  if (res && typeof res === "object" && "items" in res && Array.isArray(res.items)) {
    return res.items;
  }
  return [];
}

/**
 * Client API 2.2: Thêm Địa Chỉ Mới (POST /api/user/addresses)
 */
export async function createAddressApi(payload: CreateAddressPayload): Promise<UserAddress> {
  if (useMockData) {
    const newAddr: UserAddress = {
      addressId: crypto.randomUUID(),
      ...payload,
    };
    if (payload.isDefault) {
      MOCK_ADDRESSES.forEach((a) => (a.isDefault = false));
    }
    MOCK_ADDRESSES.unshift(newAddr);
    return mock(newAddr);
  }

  return request<UserAddress>("/api/user/addresses", {
    method: "POST",
    body: payload,
  });
}

/**
 * Client API 2.3: Cập Nhật Địa Chỉ (PUT /api/user/addresses/{addressId})
 */
export async function updateAddressApi(
  addressId: string,
  payload: UpdateAddressPayload
): Promise<UserAddress> {
  if (useMockData) {
    const idx = MOCK_ADDRESSES.findIndex((a) => a.addressId === addressId);
    const current = idx !== -1 ? MOCK_ADDRESSES[idx] : undefined;
    if (idx !== -1 && current) {
      if (payload.isDefault) {
        MOCK_ADDRESSES.forEach((a) => (a.isDefault = false));
      }
      const updated: UserAddress = { ...current, ...payload };
      MOCK_ADDRESSES[idx] = updated;
      return mock(updated);
    }
    return mock({ addressId, ...payload } as UserAddress);
  }

  return request<UserAddress>(`/api/user/addresses/${addressId}`, {
    method: "PUT",
    body: payload,
  });
}

/**
 * Client API 2.4: Đặt Làm Địa Chỉ Mặc Định 1-Click (PUT /api/user/addresses/{addressId}/set-default)
 */
export async function setDefaultAddressApi(addressId: string): Promise<boolean> {
  if (useMockData) {
    MOCK_ADDRESSES.forEach((a) => {
      a.isDefault = a.addressId === addressId;
    });
    return mock(true);
  }

  const res = await request<boolean | { isSuccess?: boolean }>(
    `/api/user/addresses/${addressId}/set-default`,
    {
      method: "PUT",
    }
  );
  return Boolean(res);
}

/**
 * Client API 2.5: Xóa Địa Chỉ (DELETE /api/user/addresses/{addressId})
 */
export async function deleteAddressApi(addressId: string): Promise<boolean> {
  if (useMockData) {
    const idx = MOCK_ADDRESSES.findIndex((a) => a.addressId === addressId);
    if (idx !== -1) MOCK_ADDRESSES.splice(idx, 1);
    return mock(true);
  }

  const res = await request<boolean | { isSuccess?: boolean }>(
    `/api/user/addresses/${addressId}`,
    {
      method: "DELETE",
    }
  );
  return Boolean(res);
}

/**
 * Xác thực địa chỉ email bằng mã OTP 6 chữ số (POST /api/auth/verify-email)
 */
export async function verifyEmail(payload: VerifyEmailRequest): Promise<LoginResponse> {
  if (!useMockData) {
    return request<LoginResponse>("/api/auth/verify-email", {
      method: "POST",
      body: payload,
    });
  }
  return mock({ accessToken: "demo-access-token", refreshToken: "demo-refresh-token" }, 400);
}

/**
 * Gửi lại mã OTP qua email (POST /api/auth/resend-otp)
 */
export async function resendOtp(payload: ResendOtpRequest): Promise<void> {
  if (!useMockData) {
    return request<void>("/api/auth/resend-otp", {
      method: "POST",
      body: payload,
    });
  }
  return mock(undefined, 400);
}

/**
 * Cấp lại mật khẩu tạm qua email khi quên (POST /api/auth/forgot-password)
 */
export async function forgotPassword(payload: ForgotPasswordRequest): Promise<void> {
  if (!useMockData) {
    return request<void>("/api/auth/forgot-password", {
      method: "POST",
      body: payload,
    });
  }
  return mock(undefined, 400);
}

/**
 * Đổi mật khẩu tài khoản người dùng (POST /api/auth/change-password) [Authorize]
 */
export async function changePassword(payload: ChangePasswordRequest): Promise<void> {
  if (!useMockData) {
    return request<void>("/api/auth/change-password", {
      method: "POST",
      body: payload,
    });
  }
  return mock(undefined, 400);
}
