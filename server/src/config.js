export const config = {
  port: Number(process.env.PORT ?? 3001),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-troque-em-producao',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173'
};
