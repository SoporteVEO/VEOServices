"use server";

import { revalidatePath } from "next/cache";

export async function revalidateSearchPath() {
  revalidatePath("/search");
}
