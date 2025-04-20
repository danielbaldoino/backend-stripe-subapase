import { fastifyCors } from "@fastify/cors";
import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import { fastify } from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { checkSubscription } from "./routes/check-subscription";
import { createCheckoutSession } from "./routes/create-checkout-session";
import { healthRoutes } from "./routes/health";
import { syncCustomerEmail } from "./routes/sync-customer-email";
import { webhook } from "./routes/webhook";

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
app.register(healthRoutes);

app.listen({ port: 3000, host: "0.0.0.0" }).then(() => {
  console.log("HTTP server running!");
});
