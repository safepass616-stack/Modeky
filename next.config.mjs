/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ESLint runs separately; disabling here avoids the useEslintrc/extensions
    // incompatibility between next@14.2.35's internal ESLint runner and
    // the eslint-config-next peer deps at runtime.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

export default nextConfig;
