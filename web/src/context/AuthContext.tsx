import React, { createContext, useContext, useState, useEffect } from 'react';
import { createDevMockToken } from '../api/client';

export type UserRole = 'STUDENT' | 'LECTURER' | 'ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  token: string | null;
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(
    (localStorage.getItem('tfa_role') as UserRole) || 'STUDENT'
  );
  const [userId, setUserId] = useState<string>(
    localStorage.getItem('tfa_user_id') || 'stu_01'
  );
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('tfa_token') || createDevMockToken('stu_01', 'STUDENT')
  );

  const [user, setUser] = useState<UserProfile | null>(() => ({
    id: userId,
    email: role === 'STUDENT' ? 'student@fpt.edu.vn' : role === 'LECTURER' ? 'lecturer@fe.edu.vn' : 'admin@fpt.edu.vn',
    name: role === 'STUDENT' ? 'Nguyễn Văn An' : role === 'LECTURER' ? 'TS. Nguyễn Văn Hùng' : 'Quản Trị Viên Hệ Thống',
    role,
  }));

  useEffect(() => {
    localStorage.setItem('tfa_role', role);
    localStorage.setItem('tfa_user_id', userId);
    if (token) {
      localStorage.setItem('tfa_token', token);
    }
  }, [role, userId, token]);

  const login = (newRole: UserRole) => {
    const newUserId = newRole === 'STUDENT' ? 'stu_01' : newRole === 'LECTURER' ? 'lec_01' : 'adm_01';
    const newToken = createDevMockToken(newUserId, newRole);
    setRole(newRole);
    setUserId(newUserId);
    setToken(newToken);
    setUser({
      id: newUserId,
      email: newRole === 'STUDENT' ? 'student@fpt.edu.vn' : newRole === 'LECTURER' ? 'lecturer@fe.edu.vn' : 'admin@fpt.edu.vn',
      name: newRole === 'STUDENT' ? 'Nguyễn Văn An' : newRole === 'LECTURER' ? 'TS. Nguyễn Văn Hùng' : 'Quản Trị Viên Hệ Thống',
      role: newRole,
    });
  };

  const logout = () => {
    localStorage.removeItem('tfa_token');
    localStorage.removeItem('tfa_role');
    localStorage.removeItem('tfa_user_id');
    setUser(null);
    setToken(null);
  };

  const switchRole = (newRole: UserRole) => {
    login(newRole);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isAuthenticated: !!token,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
