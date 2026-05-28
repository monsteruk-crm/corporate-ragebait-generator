import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  htmlLimitedBots:
    /LinkedInBot|facebookexternalhit|Twitterbot|Slackbot|Bingbot|Mediapartners-Google|AdsBot-Google|Google-PageRenderer/i,
};

export default nextConfig;
