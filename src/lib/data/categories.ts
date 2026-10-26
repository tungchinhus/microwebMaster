import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/client";
import type { Category } from "../types";
import { toCategory } from "./converters";

const categoriesCol = collection(db, "categories");

export type CategoryInput = Pick<Category, "name" | "slug" | "description" | "sortOrder">;

export async function listCategories(): Promise<Category[]> {
  const snap = await getDocs(query(categoriesCol, orderBy("sortOrder", "asc")));
  return snap.docs.map(toCategory);
}

export async function createCategory(input: CategoryInput): Promise<string> {
  const created = await addDoc(categoriesCol, { ...input, createdAt: serverTimestamp() });
  return created.id;
}

export async function updateCategory(id: string, input: Partial<CategoryInput>): Promise<void> {
  await updateDoc(doc(db, "categories", id), input);
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, "categories", id));
}
