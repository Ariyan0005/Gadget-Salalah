type ImageCrop = "fill" | "limit";

/**
 * Ask Cloudinary for a browser-friendly, correctly-sized derivative.
 * URLs from other providers are returned unchanged so existing catalog data
 * remains compatible.
 */
export function optimizeImageUrl(
  imageUrl: string | null | undefined,
  width: number,
  crop: ImageCrop = "limit",
): string | undefined {
  if (!imageUrl) return undefined;

  try {
    const url = new URL(imageUrl);
    if (!url.hostname.endsWith("cloudinary.com")) return imageUrl;

    const uploadMarker = "/image/upload/";
    const uploadIndex = url.pathname.indexOf(uploadMarker);
    if (uploadIndex === -1) return imageUrl;

    const transformation = `f_auto,q_auto,w_${width},c_${crop},dpr_auto`;
    const beforeUpload = url.pathname.slice(0, uploadIndex + uploadMarker.length);
    const afterUpload = url.pathname.slice(uploadIndex + uploadMarker.length);
    const firstSegment = afterUpload.split("/")[0] ?? "";
    const alreadyTransformed = /(^|,)(f_|q_|w_|c_|dpr_|fl_|ar_|g_)/.test(firstSegment);

    if (alreadyTransformed) return imageUrl;

    url.pathname = `${beforeUpload}${transformation}/${afterUpload}`;
    return url.toString();
  } catch {
    return imageUrl;
  }
}