import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tesseract and sharp ship their own native/wasm assets; keep them outside
  // the Next bundler so the OCR worker can resolve traineddata at runtime.
  serverExternalPackages: ["tesseract.js", "sharp"],
};

export default nextConfig;
