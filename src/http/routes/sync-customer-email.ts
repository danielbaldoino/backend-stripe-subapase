import z from "zod";
import { stripe } from "../../lib/stripe";
import { supabase } from "../../lib/supabase";
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
      const { id: userId, email } = await request.getAuthenticatedUser();

      const customerId = await supabase
        .from("profiles")
        .select("stripe_customer_id")
        .eq("id", userId)
        .single()
        .then(({ data }) => data?.stripe_customer_id);

      if (customerId) {
        const customer = await stripe.customers.update(customerId, {
          email,
        });

        if (!customer)
          throw new BadRequestError("Failed to update customer email");
      }

      return reply.status(204).send();
    }
  );
}
