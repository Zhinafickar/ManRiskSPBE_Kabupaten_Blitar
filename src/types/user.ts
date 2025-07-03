export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin' | 'superadmin' | string;
  phoneNumber?: string;
}
