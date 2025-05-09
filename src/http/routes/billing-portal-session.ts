import z from "zod";
import { stripe } from "../../lib/stripe";
import { FastifyTypedInstance } from "../../types";
import { supabase } from "../../lib/supabase";
import { auth } from "../middlewares/auth";

export async function billingPortalSession(app: FastifyTypedInstance) {
  app.register(auth).get(
    "/billing-portal-session",
    {
      schema: {
        security: [{ bearerAuth: [] }],
        response: {
          200: z.object({
            url: z.string(),
          }),
        },
      },
    },
    async (request) => {
      const { id: userId } = await request.getAuthenticatedUser();

      const customerId = await supabase
        .from("profiles")
        .select("stripe_customer_id")
        .eq("id", userId)
        .single()
        .then(({ data }) => data?.stripe_customer_id);

      if (!customerId) throw new Error("Customer ID not found");

      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
      });

      return {
        url: session.url,
      };
    }
  );
}
