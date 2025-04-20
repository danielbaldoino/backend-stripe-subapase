import z from "zod";
import { stripe } from "../../lib/stripe";
import { supabase } from "../../lib/supabase";
import { FastifyTypedInstance } from "../../types";
import { BadRequestError } from "./_errors/bad-request-error";

export async function webhook(app: FastifyTypedInstance) {
  app.post(
    "/webhook",
    {
      config: {
        rawBody: true,
      },
      schema: {
        headers: z.object({
          "stripe-signature": z.string(),
        }),
        body: z.any(),
        response: {
          200: z.string(),
        },
      },
    },
    async (request) => {
      const {
        headers: { "stripe-signature": signature },
        rawBody: payload,
      } = request;

      if (!payload) throw new BadRequestError("Missing raw body");

      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!webhookSecret)
        throw new BadRequestError(
          "Missing webhook secret, please set STRIPE_WEBHOOK_SECRET env variable"
        );

      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );

      switch (event.type) {
        case "checkout.session.completed":
          if (event.data.object.payment_status === "paid") {
            // Handle successful payment
            console.log("Payment was successful!");

            await handleSuccessfulPayment(event.data.object);
          } else if (
            event.data.object.payment_status === "unpaid" &&
            event.data.object.payment_intent
          ) {
            // Handle unpaid payment
            console.log("Payment was not successful!");
          }
          break;
        case "checkout.session.expired":
          if (event.data.object.payment_status === "unpaid") {
            // Handle expired session
            console.log("Session expired!");
          }
          break;
        case "checkout.session.async_payment_succeeded":
          if (event.data.object.payment_status === "paid") {
            // Handle successful payment
            console.log("Payment was successful!");

            await handleSuccessfulPayment(event.data.object);
          }
          break;
        case "checkout.session.async_payment_failed":
          if (event.data.object.payment_status === "unpaid") {
            // Handle unpaid payment
            console.log("Payment was not successful!");
          }
          break;
        case "customer.subscription.deleted":
          // Handle subscription cancellation
          console.log("Subscription was deleted!");
          break;
      }

      return "Webhook received";
    }
  );
}

const handleSuccessfulPayment = async (session: any) => {
  const userId = session.client_reference_id;
  const customerId = session.customer;

  await supabase
    .from("profiles")
    .update({ stripe_customer_id: customerId })
    .eq("uuid", userId);
};
