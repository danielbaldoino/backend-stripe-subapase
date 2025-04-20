import { fastify } from "fastify";
import { fastifyCors } from "@fastify/cors";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import { webhook } from "./routes/webhook";
import { checkSubscription } from "./routes/check-subscription";
import { createCheckoutSession } from "./routes/create-checkout-session";
import { syncCustomerEmail } from "./routes/sync-customer-email";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, { origin: "*" });

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Typed API",
      version: "1.0.0",
    },
  },
  transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
  routePrefix: "/docs",
});

app.register(checkSubscription);
app.register(createCheckoutSession);
app.register(syncCustomerEmail);
app.register(webhook);

app.listen({ port: 3333 }).then(() => {
  console.log("HTTP server running!");
});
