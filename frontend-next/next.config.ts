import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    reactCompiler: true,
    images: {
        // SVG画像を next/image で表示するための設定
        dangerouslyAllowSVG: true,
        // セキュリティ強化: ダウンロードを強制し、スクリプト実行を完全に遮断
        contentDispositionType: "attachment",
        contentSecurityPolicy:
            "default-src 'self'; script-src 'none'; sandbox;",
        remotePatterns: [
            {
                protocol: "https",
                hostname: "api.dicebear.com",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "http",
                hostname: "127.0.0.1",
                port: "54321",
                pathname: "/storage/v1/object/public/**",
            },
        ],
    },
};

export default nextConfig;
