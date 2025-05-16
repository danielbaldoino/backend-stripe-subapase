import "fastify";

export type GetAuthenticatedUserOptions<T> = {
  requireCustomerId?: T;
};

export type AuthenticatedUser<T> = {
  userId: string;
  email: string;
  customerId: T extends true ? string : string | undefined;
};

declare module "fastify" {
  export interface FastifyRequest {
    getAuthenticatedUser<T extends boolean>(
      options?: GetAuthenticatedUserOptions<T>
    ): Promise<AuthenticatedUser<T>>;
  }
}
