import z from "zod";
import { stripe } from "../../lib/stripe";
import { supabase } from "../../lib/supabase";
import { FastifyTypedInstance } from "../../types";
import { BadRequestError } from "./_errors/bad-request-error";

export async function syncCustomerEmail(app: FastifyTypedInstance) {
  app.patch(
    "/sync-customer-email",
    {
      schema: {
        body: z.object({
          userId: z.string(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { userId } = request.body;

      const email = await supabase.auth.admin
        .getUserById(userId)
        .then(({ data }) => data.user?.email);

      if (!email) throw new BadRequestError("Failed to update user email");

      const customerId = await supabase
        .from("profiles")
        .select("stripe_customer_id")
        .eq("uuid", userId)
        .single()
        .then(({ data }) => data?.stripe_customer_id);

      if (email && customerId) {
        const customer = await stripe.customers.update(customerId, {
          email,
        });

        if (!customer) {
          throw new BadRequestError("Failed to update customer email");
        }
      }

      return reply.status(204).send();
    }
  );
}
