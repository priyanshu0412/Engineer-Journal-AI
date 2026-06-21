import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mongoose", "@react-pdf/renderer", "exceljs"],
};

export default nextConfig;
