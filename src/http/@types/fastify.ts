import "fastify";

declare module "fastify" {
  export interface FastifyRequest {
    getAuthenticatedUser(): Promise<{
      userId: string;
      email: string;
      customerId?: string;
    }>;
  }
}
