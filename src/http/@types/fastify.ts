import { User } from '@supabase/supabase-js'
import 'fastify'

declare module 'fastify' {
  export interface FastifyRequest {
    getAuthenticatedUser(): Promise<User>
  }
}
