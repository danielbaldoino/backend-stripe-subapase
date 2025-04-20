import { stripe } from "../../lib/stripe";
import { supabase } from "../../lib/supabase";
import { FastifyTypedInstance } from "../../types";

export async function healthRoutes(app: FastifyTypedInstance) {
  app.get("/health", async (request, reply) => {
    console.log(request.headers.origin);

    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      services: {
        stripe: stripe !== null, // We have Stripe integration
        supabase: supabase !== null, // We have Supabase integration
      },
    };
  });
}
