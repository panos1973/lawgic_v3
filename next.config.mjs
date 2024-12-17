import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin();
 
/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		serverActions: {
		  bodySizeLimit: '5mb',
		},
	},
};
 
export default withNextIntl(nextConfig);