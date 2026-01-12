import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/login",
  },
});

export const config = {
  // Match the routes you want to protect
  matcher: [, "/"], // protect /order and / (home) routes
};
