import { create } from 'zustand';

interface AdminAuthStore {
  isAuthenticated: boolean;
  adminEmail: string;
  role: 'super_admin' | 'admin';
  mfaVerified: boolean;
  login: (email: string, totpCode: string) => boolean;
  logout: () => void;
}

export const useAdminAuthStore = create<AdminAuthStore>((set) => ({
  isAuthenticated: true, // Dev defaults for rapid back-office inspection
  adminEmail: 'security-admin@venom.finance',
  role: 'super_admin',
  mfaVerified: true,

  login: (email: string, totpCode: string) => {
    if (totpCode.length === 6) {
      set({
        isAuthenticated: true,
        adminEmail: email,
        role: 'super_admin',
        mfaVerified: true,
      });
      return true;
    }
    return false;
  },

  logout: () => {
    set({
      isAuthenticated: false,
      adminEmail: '',
      role: 'admin',
      mfaVerified: false,
    });
  },
}));
