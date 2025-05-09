import z from "zod";
import { stripe } from "../../lib/services/stripe";
import { FastifyTypedInstance } from "../../types";
import { auth } from "../middlewares/auth";
import { BadRequestError } from "./_errors/bad-request-error";

export async function billingPortalSession(app: FastifyTypedInstance) {
  app.register(auth).get(
    "/billing-portal-session",
    {
      schema: {
        security: [{ bearerAuth: [] }],
        response: {
          200: z.object({
            portalUrl: z.string(),
          }),
        },
      },
    },
    async (request) => {
      const { customerId } = await request.getAuthenticatedUser();

      if (!customerId) throw new BadRequestError("Customer ID not found");

      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
      });

      return {
        portalUrl: session.url,
      };
    }
  );
}
