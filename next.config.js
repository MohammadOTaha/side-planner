/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	poweredByHeader: false,
	reactStrictMode: true,
	swcMinify: true,
	images: {
		unoptimized: false,
	},
};

module.exports = nextConfig;
