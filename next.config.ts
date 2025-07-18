// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
//   reactStrictMode: true,
// };

// module.exports = {
//   images: {
//     domains: ['i.pravatar.cc'],
//   },
// };

// export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        port: '',
        pathname: '/uc**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      }
    ],
    // Hoặc sử dụng cách cũ (tương thích với phiên bản cũ hơn)
    // domains: ['drive.google.com', 'i.pravatar.cc', 'lh3.googleusercontent.com'],
  },
  eslint: {
    ignoreDuringBuilds: true, // Tạm thời bỏ qua lỗi ESLint
  },
};

export default nextConfig;