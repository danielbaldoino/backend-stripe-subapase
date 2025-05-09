import z from "zod";
import { stripe } from "../../lib/stripe";
import { FastifyTypedInstance } from "../../types";
import Stripe from "stripe";
import { auth } from "../middlewares/auth";
import { supabase } from "../../lib/supabase";
import { BadRequestError } from "./_errors/bad-request-error";

export async function activeSubscription(app: FastifyTypedInstance) {
  app.register(auth).get(
    "/active-subscription",
    {
      schema: {
        security: [{ bearerAuth: [] }],
        response: {
          200: z.object({
            subscription: z.object({
              id: z.string(),
              amount: z.number().nullable(),
              currency: z.string(),
              interval: z.enum(["day", "week", "month", "year"]),
              product: z.object({
                id: z.string(),
                name: z.string(),
              }),
            }),
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

      const {
        data: [subscription],
      } = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        expand: ["data.plan.product"],
        limit: 1,
      });

      if (subscription) {
        throw new BadRequestError("No active subscription found");
      }

      const plan = (subscription as Stripe.Subscription & { plan: Stripe.Plan })
        .plan as Stripe.Plan & { product: Stripe.Product };

      return {
        subscription: plan,
      };
    }
  );
}
