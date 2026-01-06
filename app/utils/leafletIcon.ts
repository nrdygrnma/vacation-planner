/**
 * Icon helper for Leaflet HTML strings (Nuxt UI / Iconify compatible)
 */
export const leafletIcon = (
  name: string,
  size = 16,
  color = "currentColor",
) => {
  const encoded = encodeURIComponent(color);

  return `
    <img
      src="https://api.iconify.design/${name}.svg?color=${encoded}"
      width="${size}"
      height="${size}"
      style="display:block"
    />
  `;
};
