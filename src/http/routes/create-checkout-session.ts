import z from "zod";
import { stripe } from "../../lib/stripe";
import { supabase } from "../../lib/supabase";
import { FastifyTypedInstance } from "../../types";
import { auth } from "../middlewares/auth";
import { BadRequestError } from "./_errors/bad-request-error";

export async function createCheckoutSession(app: FastifyTypedInstance) {
  app.register(auth).post(
    "/create-checkout-session",
    {
      schema: {
        security: [{ bearerAuth: [] }],
        body: z.object({
          priceId: z.string(),
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

      const successUrl = process.env.SUCCESS_URL;

      if (!successUrl) throw new BadRequestError("Missing success URL");

      const { priceId } = request.body;

      const customerId = await supabase
        .from("profiles")
        .select("stripe_customer_id")
        .eq("id", userId)
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
        success_url: successUrl,
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
