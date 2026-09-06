import { PrismaClient } from '@prisma/client';

let prisma;

try {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  });
} catch (err) {
  console.warn('⚠️ PrismaClient initialization fallback active:', err.message);
  prisma = new Proxy(
    {},
    {
      get(target, prop) {
        if (prop === '$disconnect' || prop === '$connect') {
          return async () => {};
        }
        return new Proxy(
          {},
          {
            get(targetInner, methodProp) {
              if (methodProp === 'findUnique' || methodProp === 'findFirst') {
                return async () => null;
              }
              return async () => [];
            },
          }
        );
      },
    }
  );
}

export default prisma;
