// next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  
  // ✅ أضف هذا لتفعيل الوصول من الموبايل
  allowedDevOrigins: ['192.168.1.5', 'localhost', '127.0.0.1'],
  
  // ✅ أو استخدم wildcard للسماح لأي جهاز (للتطوير فقط)
  // allowedDevOrigins: ['*'],
};

export default nextConfig;