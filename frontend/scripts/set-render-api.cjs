// Render injects the API hostname at build time for the Angular production bundle.
const fs = require('node:fs');
const host = process.env.BACKEND_HOST;
if (!host || !/^[a-z0-9.-]+$/i.test(host)) {
  throw new Error('BACKEND_HOST must be a valid API hostname from Render');
}
fs.writeFileSync(
  'src/environments/environment.prod.ts',
  `export const environment = {
  production: true,
  BACKEND_PUBLIC_DOMAIN: 'https://${host}',
};
`,
);
