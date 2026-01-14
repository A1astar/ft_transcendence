import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { initAuthenticationService, initFastify } from "./init.js";
import { Auth } from "./auth.js";
import color from "chalk";

async function registerOAuth(
  path: string,
  request: FastifyRequest,
  reply: FastifyReply,
  auth: Auth,
  fastify: FastifyInstance
) {
  let provider: string;
  const oauthMatch = path?.match(/^\/api\/auth\/oauth\/(\w+)/);

  if (oauthMatch) {
    provider = oauthMatch[1];
    console.log(color.bold.blue(provider));
  }

  if (path.includes("/callback")) {
    try {
      const token = await (
        fastify as any
      ).googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);

      const userInfoRes = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: {
            Authorization: `Bearer ${token.token.access_token}`,
          },
        }
      );
      const userInfo = await userInfoRes.json();

      await auth.loginOrRegisterOAuthUser(request, reply, {
        email: userInfo.email,
        name: userInfo.name || userInfo.email.split("@")[0],
      });

      // Redirect to frontend
      reply.redirect("/gameMenu");
    } catch (error) {
      console.error("OAuth callback error:", error);
      reply.redirect("/login?error=oauth_failed");
    }
  } else {
    reply.code(409).send({ error: "Wrong oauth provider." });
  }
}

async function manageRequest(fastify: FastifyInstance, auth: Auth) {
  fastify.all("/*", async (request, reply) => {
    const fullPath = request.raw.url;
    const urlObj = new URL(fullPath || "", "http://localhost");
    const pathname = urlObj.pathname;

    console.log(
      color.bold.blue("Authentication"),
      color.cyan(`${request.method} ${fullPath}`)
    );

    console.log("request: ", request.body);
    switch (pathname) {
      case "/api/auth/login":
        await auth.loginUser(request, reply);
        break;
      case "/api/auth/register":
        await auth.registerUser(request, reply);
        break;
      case "/api/auth/2fa/enable":
        await auth.enableTwoFactor(request, reply);
        break;
      case "/api/auth/2fa/disable":
        await auth.disableTwoFactor(request, reply);
        break;
      case "/api/auth/logout":
        try {
          (reply as any).clearCookie?.("access_token", { path: "/" });
          await reply.code(200).send({ message: "Logged out" });
        } catch (error) {
          console.error("[auth] logout error", error);
          return reply.code(500).send({ error: "Logout failed" });
        }
        break;
      case "/api/auth/userinfo":
        await auth.getUserinfo(request, reply);
        break;
      default:
        if (pathname.startsWith("/api/auth/oauth/")) {
          await registerOAuth(fullPath || "", request, reply, auth, fastify);
        } else {
          reply.code(404).send({ error: "Route not found" });
        }
        break;
    }
  });
}

async function main() {
  try {
    const auth = await initAuthenticationService();
    const fastify = await initFastify(auth);

    await manageRequest(fastify, auth);

    await fastify.listen({ port: 3001, host: "0.0.0.0" });
    console.log(
      color.green.bold("Authentication Service running on port 3001")
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
