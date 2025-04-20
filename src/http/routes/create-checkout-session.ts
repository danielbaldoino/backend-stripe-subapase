import z from "zod";
import { stripe } from "../../lib/stripe";
import { supabase } from "../../lib/supabase";
import { FastifyTypedInstance } from "../../types";
import { BadRequestError } from "./_errors/bad-request-error";

export async function createCheckoutSession(app: FastifyTypedInstance) {
  app.post(
    "/create-checkout-session",
    {
      schema: {
        body: z.object({
          priceId: z.string(),
          userId: z.string(),
        }),
        response: {
          200: z.object({
            checkoutUrl: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { priceId, userId } = request.body;

      const email = await supabase.auth.admin
        .getUserById(userId)
        .then(({ data }) => data.user?.email);

      if (!email) throw new BadRequestError("Failed to retrieve user email");

      const customerId = await supabase
        .from("profiles")
        .select("stripe_customer_id")
        .eq("uuid", userId)
        .single()
        .then(({ data }) => data?.stripe_customer_id);

      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card", "boleto"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${process.env.FRONTEND_URL}`,
        cancel_url: `${process.env.FRONTEND_URL}`,
        client_reference_id: userId,
        customer: customerId || undefined,
        customer_email: customerId || email,
      });

      return {
        checkoutUrl: checkoutSession.url as string,
      };
    }
  );
}
