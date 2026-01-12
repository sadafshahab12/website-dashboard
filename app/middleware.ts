import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/login",
  },
});

export const config = {
  // Match the routes you want to protect
  matcher: ["/order", "/contacts", "/"], // protect /order and / (home) routes
};
