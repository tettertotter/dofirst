/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { appDir: true },
  transpilePackages: ['@todaypool/ui', '@todaypool/design-system']
};
export default nextConfig;
