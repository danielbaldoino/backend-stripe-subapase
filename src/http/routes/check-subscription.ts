import z from "zod";
import { stripe } from "../../lib/stripe";
import { supabase } from "../../lib/supabase";
import { FastifyTypedInstance } from "../../types";
import { auth } from "../middlewares/auth";

export async function checkSubscription(app: FastifyTypedInstance) {
  app.register(auth).get(
    "/check-subscription",
    {
      schema: {
        security: [{ bearerAuth: [] }],
        response: {
          200: z.object({
            subscriptionStatus: z.string(),
          }),
        },
      },
    },
    async (request) => {
      const { id: userId } = await request.getAuthenticatedUser();

      const customerId = await supabase
        .from("profiles")
        .select("stripe_customer_id")
        .eq("uuid", userId)
        .single()
        .then(({ data }) => data?.stripe_customer_id);

      if (!customerId) return { subscriptionStatus: "inactive" };

      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "all",
      });

      const isActive = subscriptions.data.some(
        (subscription) => subscription.status === "active"
      );

      return {
        subscriptionStatus: isActive ? "active" : "inactive",
      };
    }
  );
}
