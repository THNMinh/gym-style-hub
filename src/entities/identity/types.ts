export type UserRole = "Customer" | "Admin";

export interface User {
  userId: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: UserRole;
  isEmailVerified: boolean;
}

export type AddressType = "Home" | "Office";

export interface UserAddress {
  addressId: string;
  userId: string;
  receiverName: string;
  phoneNumber: string;
  addressLine1: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
  addressType: AddressType;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends Credentials {
  fullName: string;
}
