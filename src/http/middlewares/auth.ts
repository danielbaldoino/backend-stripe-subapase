import type { FastifyInstance } from "fastify";
import { fastifyPlugin } from "fastify-plugin";

import { getCustomerIdByUserId } from "../../lib/db/repository";
import { supabase } from "../../lib/services/supabase";
import {
  AuthenticatedUser,
  GetAuthenticatedUserOptions,
} from "../@types/fastify";
import { BadRequestError } from "../routes/_errors/bad-request-error";
import { UnauthorizedError } from "../routes/_errors/unauthorized-error";

export const auth = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook("preHandler", async (request) => {
    request.getAuthenticatedUser = async <T extends boolean>(
      options: GetAuthenticatedUserOptions<T> = {}
    ) => {
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

      const { id: userId, email } = user;
      const customerId = await getCustomerIdByUserId(userId);

      if (options.requireCustomerId && !customerId)
        throw new BadRequestError(
          "User has no associated customer ID. Please complete the registration process."
        );

      return { userId, email, customerId } as AuthenticatedUser<T>;
    };
  });
});
