import Stripe from "stripe";
import z from "zod";
import { stripe } from "../../lib/services/stripe";
import { FastifyTypedInstance } from "../../types";
import { auth } from "../middlewares/auth";

type SubscriptionWithPlan = Stripe.Subscription & {
  plan: Stripe.Plan & { product: Stripe.Product };
};

export async function activeSubscription(app: FastifyTypedInstance) {
  app.register(auth).get(
    "/active-subscription",
    {
      schema: {
        security: [{ bearerAuth: [] }],
        response: {
          200: z.object({
            subscription: z
              .object({
                id: z.string(),
                plan: z.object({
                  id: z.string(),
                  amount: z.number().nullable(),
                  currency: z.string(),
                  interval: z.enum(["day", "week", "month", "year"]),
                }),
              })
              .nullable(),
          }),
        },
      },
    },
    async (request) => {
      const { customerId } = await request.getAuthenticatedUser({
        requireCustomerId: true,
      });

      const {
        data: [subscription],
      } = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        expand: ["data.plan.product"],
        limit: 1,
      });

      return {
        subscription: subscription
          ? (subscription as SubscriptionWithPlan)
          : null,
      };
    }
  );
}
