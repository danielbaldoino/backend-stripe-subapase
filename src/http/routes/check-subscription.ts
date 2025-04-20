import z from "zod";
import { FastifyTypedInstance } from "../../types";
import { supabase } from "../../lib/supabase";
import { stripe } from "../../lib/stripe";

export async function checkSubscription(app: FastifyTypedInstance) {
  app.get(
    "check-subscription/:userId",
    {
      schema: {
        params: z.object({
          userId: z.string(),
        }),
        response: {
          200: z.object({
            subscriptionStatus: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { userId } = request.params;

      const customerId = await supabase
        .schema("public")
        .from("profiles")
        .select("stripe_customer_id")
        .eq("id", userId)
        .then(({ data }) => data?.[0]?.stripe_customer_id);

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
