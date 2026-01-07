import { defineEventHandler, getQuery, sendStream } from "h3";

export default defineEventHandler(async (event) => {
  const { url } = getQuery(event);

  if (!url || typeof url !== "string") {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing image URL",
    });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: `Failed to fetch image: ${response.statusText}`,
      });
    }

    const contentType = response.headers.get("content-type");
    if (contentType) {
      setHeader(event, "Content-Type", contentType);
    }

    // Add caching headers to avoid re-fetching frequently
    setHeader(event, "Cache-Control", "public, max-age=3600");

    return sendStream(event, response.body!);
  } catch (error: any) {
    console.error("Image proxy error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error proxying image",
    });
  }
});
