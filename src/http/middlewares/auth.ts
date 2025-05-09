import type { FastifyInstance } from "fastify";
import { fastifyPlugin } from "fastify-plugin";

import { getCustomerIdByUserId } from "../../lib/db/repository";
import { supabase } from "../../lib/services/supabase";
import { UnauthorizedError } from "../routes/_errors/unauthorized-error";

export const auth = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook("preHandler", async (request) => {
    request.getAuthenticatedUser = async () => {
      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer "))
        throw new UnauthorizedError("No token provided");

      const token = authHeader.split(" ")[1];

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user)
        throw new UnauthorizedError("Invalid or expired token");

      return {
        userId: user.id,
        email: user.email as string,
        customerId: await getCustomerIdByUserId(user.id),
      };
    };
  });
});
