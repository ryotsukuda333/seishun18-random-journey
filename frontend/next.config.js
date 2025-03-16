/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        domains: ['images.unsplash.com'],
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: process.env.NODE_ENV === 'production'
                    ? 'https://api.randomjourney.example.com/:path*'
                    : 'http://localhost:8787/:path*',
            },
        ];
    },
};

module.exports = nextConfig; 