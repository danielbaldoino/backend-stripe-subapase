
import { stripe } from "../../lib/services/stripe";
import { supabase } from "../../lib/services/supabase";
import { FastifyTypedInstance } from "../../types";

export async function healthRoutes(app: FastifyTypedInstance) {
  app.get("/health", () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    services: {
      stripe: stripe !== null, // We have Stripe integration
      supabase: supabase !== null, // We have Supabase integration
    },
  }));
}
