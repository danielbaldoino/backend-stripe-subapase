import dotenv from "dotenv";
import Stripe from "stripe";
import { BadRequestError } from "../http/routes/_errors/bad-request-error";

dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new BadRequestError(
    "Missing Stripe secret key, please set STRIPE_SECRET_KEY env variable"
  );
}

export const stripe = new Stripe(stripeSecretKey);
