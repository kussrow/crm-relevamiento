import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Genera un build "standalone" para una imagen Docker chica
  output: "standalone",
};

export default nextConfig;
