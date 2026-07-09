"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  canAccessAdminArea,
  canReadModule,
  canWriteModule,
  isOwnerUser,
  parsePermissionsFromFirestore,
} from "@/lib/permissions";
import type { PermissionModule, TeamPermissions, User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isOwner: boolean;
  canAccessAdmin: boolean;
  canRead: (module: PermissionModule) => boolean;
  canWrite: (module: PermissionModule) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapUserDoc(id: string, email: string, data: Record<string, unknown>): User {
  return {
    id,
    email,
    displayName: (data.displayName as string) || "",
    role: (data.role as User["role"]) || "customer",
    phone: data.phone as string | undefined,
    address: data.address as User["address"],
    permissions: parsePermissionsFromFirestore(data.permissions),
    active: data.active !== false,
    createdAt:
      (data.createdAt as { toDate?: () => Date })?.toDate?.() || new Date(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const userDoc = await getDoc(doc(db, "users", fbUser.uid));
        if (userDoc.exists()) {
          setUser(mapUserDoc(fbUser.uid, fbUser.email || "", userDoc.data()));
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, "users", cred.user.uid));
    if (!userDoc.exists()) return null;

    const loggedInUser = mapUserDoc(
      cred.user.uid,
      cred.user.email || "",
      userDoc.data()
    );
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    const role = email === adminEmail ? "admin" : "customer";

    await setDoc(doc(db, "users", cred.user.uid), {
      email,
      displayName,
      role,
      active: true,
      createdAt: serverTimestamp(),
    });
  };

  const logout = async () => {
    await signOut(auth);
  };

  const canRead = useCallback(
    (module: PermissionModule) => canReadModule(user, module),
    [user]
  );

  const canWrite = useCallback(
    (module: PermissionModule) => canWriteModule(user, module),
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        login,
        register,
        logout,
        isAdmin: canAccessAdminArea(user),
        isOwner: isOwnerUser(user),
        canAccessAdmin: canAccessAdminArea(user),
        canRead,
        canWrite,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
