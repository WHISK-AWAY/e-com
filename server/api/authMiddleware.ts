import dotenv from 'dotenv';
dotenv.config();
import { auth } from 'express-openid-connect';

const config = {
  authRequired: false,
  auth0Logout: true,
  authorizationParams: {
    scope: 'openid read:users',
    audience: 'e-comPB',
  },
  secret: '289fahnrga-yas83nfa3ca-',
  baseURL: 'http://localhost:3001',
  clientID: '6QeCYaBvy5ZgeovBHHqZYV7WTkix7W2z',
  issuerBaseURL: 'https://dev-z5aj5eewyq3duaqc.us.auth0.com',
};

export const auth0config = auth(config);

// import { auth, requiredScopes } from 'express-oauth2-jwt-bearer';

// export const jwtCheck = auth({
//   audience: 'e-comPB',
//   issuerBaseURL: 'https://dev-z5aj5eewyq3duaqc.us.auth0.com/',
//   tokenSigningAlg: 'RS256',
//   secret: '2eah80sd0eansda03enf',
// });

// export const requiresAdmin = requiredScopes('read:users');

// export const jwtCheck = auth({
//   audience: 'e-com',
//   issuerBaseURL: 'https://dev-3nurd80vhso7rxtr.us.auth0.com/',
//   tokenSigningAlg: 'RS256',
// });
