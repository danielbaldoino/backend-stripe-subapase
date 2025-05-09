import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { BadRequestError } from "../../http/routes/_errors/bad-request-error";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new BadRequestError(
    "Missing Supabase URL or service role key, please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env variables"
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
