/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // 2回レンダリングされてgithubAuthのMutationでエラーが出てしまうためfalse
  images: {
    domains: ["avatars.githubusercontent.com", "randomuser.me"],
  },
};

module.exports = nextConfig;
