import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AuthSession, StoredUser, User } from '../types/auth';
import { deleteStoredPhoto, pickProfilePhoto } from '../services/profilePhoto';

const SESSION_KEY = '@meal_fit_session';
const USERS_KEY = '@meal_fit_users';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateAvatar: () => Promise<void>;
  removeAvatar: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function createId(): string {
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function getUsers(): Promise<StoredUser[]> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveUsers(users: StoredUser[]): Promise<void> {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function toSession(stored: StoredUser): AuthSession {
  return {
    user: {
      id: stored.id,
      name: stored.name,
      email: stored.email,
      avatarUri: stored.avatarUri ?? null,
    },
    token: `local-${stored.id}`,
  };
}

async function updateStoredUser(userId: string, patch: Partial<StoredUser>): Promise<StoredUser | null> {
  const users = await getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) return null;
  users[idx] = { ...users[idx], ...patch };
  await saveUsers(users);
  return users[idx];
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const session: AuthSession = JSON.parse(raw);
      const users = await getUsers();
      const match = users.find((u) => u.id === session.user.id);
      if (!match) {
        await AsyncStorage.removeItem(SESSION_KEY);
        setUser(null);
        return;
      }
      setUser(toSession(match).user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const persistSession = async (session: AuthSession) => {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session.user);
  };

  const login = useCallback(async (email: string, password: string) => {
    const normalized = normalizeEmail(email);
    const users = await getUsers();
    const match = users.find((u) => u.email === normalized && u.password === password);
    if (!match) {
      throw new Error('E-posta veya şifre hatalı.');
    }
    await persistSession(toSession(match));
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const trimmedName = name.trim();
    const normalized = normalizeEmail(email);
    if (trimmedName.length < 2) {
      throw new Error('Ad en az 2 karakter olmalı.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new Error('Geçerli bir e-posta adresi gir.');
    }
    if (password.length < 6) {
      throw new Error('Şifre en az 6 karakter olmalı.');
    }
    const users = await getUsers();
    if (users.some((u) => u.email === normalized)) {
      throw new Error('Bu e-posta adresi zaten kayıtlı.');
    }
    const newUser: StoredUser = {
      id: createId(),
      name: trimmedName,
      email: normalized,
      password,
    };
    await saveUsers([...users, newUser]);
    await persistSession(toSession(newUser));
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const updateAvatar = useCallback(async () => {
    if (!user) return;
    const uri = await pickProfilePhoto(user.id);
    if (!uri) return;
    await deleteStoredPhoto(user.avatarUri ?? undefined);
    const updated = await updateStoredUser(user.id, { avatarUri: uri });
    if (!updated) return;
    const session = toSession(updated);
    await persistSession(session);
  }, [user]);

  const removeAvatar = useCallback(async () => {
    if (!user) return;
    await deleteStoredPhoto(user.avatarUri ?? undefined);
    const updated = await updateStoredUser(user.id, { avatarUri: null });
    if (!updated) return;
    const session = toSession(updated);
    await persistSession(session);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateAvatar, removeAvatar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
