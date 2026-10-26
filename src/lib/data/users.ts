import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/client";
import type { UserProfile } from "../types";
import { toUserProfile } from "./converters";

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? toUserProfile(snap) : null;
}

/** Tạo hồ sơ khách hàng lần đầu. Quyền admin chỉ được cấp bằng script phía server. */
export async function ensureUserProfile(
  uid: string,
  email: string,
  displayName: string,
): Promise<UserProfile> {
  const existing = await getUserProfile(uid);
  if (existing) return existing;
  await setDoc(doc(db, "users", uid), {
    email,
    displayName,
    phone: "",
    role: "customer",
    createdAt: serverTimestamp(),
  });
  return { uid, email, displayName, phone: "", role: "customer", createdAt: null };
}

export async function updateMyProfile(
  uid: string,
  input: Pick<UserProfile, "displayName" | "phone">,
): Promise<void> {
  await updateDoc(doc(db, "users", uid), input);
}

export async function listUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc")));
  return snap.docs.map(toUserProfile);
}
