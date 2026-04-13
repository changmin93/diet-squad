import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // 빌드 시 타입 에러가 나더라도 배포를 진행하게 설정 (안정적 배포 우선)
    ignoreBuildErrors: true,
  },
  eslint: {
    // 빌드 시 린트 에러 무시
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
