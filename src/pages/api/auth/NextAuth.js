import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";

export default NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      // Request the `gist` scope so we can read/write your gist
      scope: "read:user gist"
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
});
