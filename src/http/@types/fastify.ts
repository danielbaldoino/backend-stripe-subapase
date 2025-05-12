import "fastify";

declare module "fastify" {
  export interface FastifyRequest {
    getAuthenticatedUser({
      requireCustomerId,
    }?: {
      requireCustomerId?: boolean;
    }): Promise<{
      userId: string;
      email: string;
      customerId?: string;
    }>;
  }
}
