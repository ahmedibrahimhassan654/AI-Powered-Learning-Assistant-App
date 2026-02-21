export const getImageUrl = (imagePath) => {
  if (!imagePath)
    return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  const normalizedPath = imagePath.replace(/\\/g, "/");
  if (normalizedPath.startsWith("http") || normalizedPath.startsWith("data:"))
    return normalizedPath;
  const path = normalizedPath.startsWith("/")
    ? normalizedPath
    : `/${normalizedPath}`;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  return `${apiUrl}${path}`;
};
