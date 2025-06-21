/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    eslint: {
        ignoreDuringBuilds: true,
    },
    logging: {
        fetches: {
            fullUrl: true,
        },
    },
    allowedDevOrigins: [ // 개발모드
        new URL(process.env.NEXT_PUBLIC_CLIENT_HOST).hostname // 호스트만 추출: 127.0.0.1
    ],
    async rewrites(){
        return[
            {
                source: `/api/:path*`,
                destination: `${process.env.NEXT_PUBLIC_SERVER_MAIN}/:path*`
            },
            {
                source: `/${process.env.NEXT_PUBLIC_FOLDER}/:path*`, // /data/:path
                destination: `${process.env.NEXT_PUBLIC_SERVER_MAIN}/${process.env.NEXT_PUBLIC_FOLDER}/:path*`
            },
        ]
    }
};

export default nextConfig;