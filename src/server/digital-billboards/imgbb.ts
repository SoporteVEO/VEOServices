/**
 * Upload a base64-encoded image to ImgBB and return URLs for the Image model.
 */
export type ImgbbUploadResult = {
  completeUrl: string;
  thumbnailUrl: string;
  mediumUrl: string;
  deleteUrl: string | null;
};

export async function uploadToImgbb(imageBase64: string): Promise<ImgbbUploadResult> {
  const key = process.env.IMGBB_API_KEY;
  if (!key) {
    throw new Error("IMGBB_API_KEY is not configured");
  }

  const url = new URL("https://api.imgbb.com/1/upload");
  url.searchParams.set("key", key);
  url.searchParams.set("expiration", "600");

  const body = new FormData();
  body.append("image", imageBase64);

  const res = await fetch(url.toString(), { method: "POST", body });
  const json = (await res.json()) as {
    success?: boolean;
    status?: number;
    data?: {
      url?: string;
      delete_url?: string;
      image?: { url?: string };
      thumb?: { url?: string };
      medium?: { url?: string };
    };
    error?: { message?: string };
  };

  if (!json.success || !json.data) {
    const msg =
      json.error?.message ||
      (typeof json === "object" ? JSON.stringify(json) : "ImgBB upload failed");
    throw new Error(msg);
  }

  const d = json.data;
  const completeUrl = d.url ?? d.image?.url ?? "";
  if (!completeUrl) {
    throw new Error("ImgBB response missing image URL");
  }

  return {
    completeUrl,
    thumbnailUrl: d.thumb?.url ?? completeUrl,
    mediumUrl: d.medium?.url ?? completeUrl,
    deleteUrl: d.delete_url ?? null,
  };
}
