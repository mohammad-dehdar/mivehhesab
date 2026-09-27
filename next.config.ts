import type { NextConfig } from "next";

// Set NEXT_PUBLIC_BASE_PATH when hosting under a sub-path (e.g. GitHub Pages: "/fruit-accountant").
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Fully static site: the app and its SQLite database run in the browser.
  output: "export",
  // Every page is a folder with index.html, which any static host serves.
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
};

export default nextConfig;