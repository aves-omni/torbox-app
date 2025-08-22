import { withSentryConfig } from '@sentry/nextjs';
import withPWA from 'next-pwa';
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path'; // Add this import

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  swcMinify: true, // Move this here from webpack config
  
  // Optimize bundle size
  experimental: {
    optimizePackageImports: ['lodash', 'date-fns', 'chart.js'],
  },
  
  // Handle SVG files
  webpack: (config, { dev, isServer }) => {
    // Add SVG handling
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    
    // Rest of webpack config...
    // Bundle analyzer
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
        })
      );
    }
    
    // Optimize code splitting
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          enforce: true,
        },
      },
    };
    
    // Optimize cache performance
    config.cache = {
      type: 'filesystem',
      compression: 'gzip',
      maxAge: 172800000, // 2 days
      buildDependencies: {
        config: [import.meta.url], // Already using import.meta.url
      },
      cacheDirectory: path.resolve(process.cwd(), '.next/cache/webpack'), // Use absolute path
      name: 'webpack-cache', // Name the cache
      version: '1.0', // Cache version
    };
    
    // Removed swcMinify from here - it's now at the top level
    
    return config;
  },
};

const withPWAConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB limit
  buildExcludes: [/.*\.map$/], // Exclude source maps from PWA cache
})(nextConfig);

export default withSentryConfig(withNextIntl(withPWAConfig), {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: 'torbox-manager',
  project: 'javascript-nextjs',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});
