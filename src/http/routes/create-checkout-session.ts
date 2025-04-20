import z from "zod";
import { FastifyTypedInstance } from "../../types";
import { stripe } from "../../lib/stripe";
import { supabase } from "../../lib/supabase";
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

      const customerId = await supabase
        .schema("public")
        .from("profiles")
        .select("stripe_customer_id")
        .eq("id", userId)
        .single()
        .then(({ data }) => data?.stripe_customer_id);

      if (!customerId) throw new BadRequestError("Customer not found");

      const email = await supabase
        .schema("auth")
        .from("users")
        .select("email")
        .eq("id", userId)
        .single()
        .then(({ data }) => data?.email);

      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${process.env.FRONTEND_URL}/success`,
        cancel_url: `${process.env.FRONTEND_URL}/cancel`,
        client_reference_id: userId,
        customer: customerId,
        customer_email: email,
      });

      return {
        checkoutUrl: checkoutSession.url as string,
      };
    }
  );
}
