import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '1.bp.blogspot.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '1.bp.blogspot.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'berita.blitarkab.go.id',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
