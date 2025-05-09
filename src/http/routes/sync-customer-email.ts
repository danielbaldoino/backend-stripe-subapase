import z from "zod";
import { stripe } from "../../lib/services/stripe";
import { FastifyTypedInstance } from "../../types";
import { auth } from "../middlewares/auth";
import { BadRequestError } from "./_errors/bad-request-error";

export async function syncCustomerEmail(app: FastifyTypedInstance) {
  app.register(auth).patch(
    "/sync-customer-email",
    {
      schema: {
        security: [{ bearerAuth: [] }],
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { email, customerId } = await request.getAuthenticatedUser();

      if (customerId) {
        const customer = await stripe.customers.update(customerId, {
          email,
        });

        if (!customer)
          throw new BadRequestError("Failed to update customer email");
      } else throw new BadRequestError("Customer ID not found");

      return reply.status(204).send();
    }
  );
}
