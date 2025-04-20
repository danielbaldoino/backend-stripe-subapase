import type { FastifyInstance } from "fastify";
import { fastifyPlugin } from "fastify-plugin";

import { supabase } from "../../lib/supabase";
import { UnauthorizedError } from "../routes/_errors/unauthorized-error";

export const auth = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook("preHandler", async (request) => {
    request.getAuthenticatedUser = async () => {
      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer "))
        throw new UnauthorizedError("No token provided");

      const token = authHeader.split(" ")[1];

      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data)
        throw new UnauthorizedError("Invalid or expired token");

      return data.user;
    };
  });
});
