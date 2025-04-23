import z from "zod";
import { stripe } from "../../lib/stripe";
import { supabase } from "../../lib/supabase";
import { FastifyTypedInstance } from "../../types";
import { auth } from "../middlewares/auth";

export async function createCheckoutSession(app: FastifyTypedInstance) {
  app.register(auth).post(
    "/create-checkout-session",
    {
      schema: {
        security: [{ bearerAuth: [] }],
        body: z.object({
          priceId: z.string(),
          callbackUrl: z.string().url(),
        }),
        response: {
          200: z.object({
            checkoutUrl: z.string(),
          }),
        },
      },
    },
    async (request) => {
      const { id: userId, email } = await request.getAuthenticatedUser();

      const { priceId, callbackUrl } = request.body;

      const customerId = await supabase
        .from("profiles")
        .select("stripe_customer_id")
        .eq("uuid", userId)
        .single()
        .then(({ data }) => data?.stripe_customer_id);

      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card", "boleto", "pix"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${callbackUrl}/success`,
        cancel_url: `${callbackUrl}/cancel`,
        client_reference_id: userId,
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
      });

      return {
        checkoutUrl: checkoutSession.url as string,
      };
    }
  );
}
