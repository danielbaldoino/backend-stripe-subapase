import z from "zod";
import { stripe } from "../../lib/services/stripe";
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
      const { userId, email, customerId } =
        await request.getAuthenticatedUser();

      const successUrl = process.env.SUCCESS_URL;

      if (!successUrl) throw new BadRequestError("Missing success URL");

      const { priceId } = request.body;

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
