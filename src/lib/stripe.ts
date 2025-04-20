import Stripe from "stripe";
import { BadRequestError } from "../http/routes/_errors/bad-request-error";

const stripeScreetKey = process.env.STRIPE_SECRET_KEY;

if (!stripeScreetKey)
  throw new BadRequestError(
    "Missing Stripe secret key, please set STRIPE_SECRET_KEY env variable"
  );

export const stripe = new Stripe(stripeScreetKey);
