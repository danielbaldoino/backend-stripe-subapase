import { fastifyCors } from "@fastify/cors";
import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import { fastify } from "fastify";
import { fastifyRawBody } from "fastify-raw-body";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { activeSubscription } from "./routes/active-subscription";
import { createCheckoutSession } from "./routes/create-checkout-session";
import { healthRoutes } from "./routes/health";
import { syncCustomerEmail } from "./routes/sync-customer-email";
import { webhook } from "./routes/webhook";
import { billingPortalSession } from "./routes/billing-portal-session";

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
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
  routePrefix: "/docs",
});

 app.register(fastifyRawBody, {
  field: 'rawBody',
  global: false, 
  encoding: 'utf8',
  runFirst: true
});

app.register(activeSubscription);
app.register(createCheckoutSession);
app.register(billingPortalSession);
app.register(syncCustomerEmail);
app.register(webhook);
app.register(healthRoutes);

app.listen({ port: 3000, host: "0.0.0.0" }).then(() => {
  console.log("HTTP server running!");
});
