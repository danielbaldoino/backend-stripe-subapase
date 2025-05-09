import { supabase } from "../services/supabase";

export const getCustomerIdByUserId = async (userId: string) => {
  const customerId = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", userId)
    .single()
    .then(({ data }) => data?.stripe_customer_id || undefined);
  return customerId as string | undefined;
};

export const setCustomerId = async (userId: string, customerId: string) => {
  await supabase
    .from("profiles")
    .update({ stripe_customer_id: customerId })
    .eq("id", userId);
};
