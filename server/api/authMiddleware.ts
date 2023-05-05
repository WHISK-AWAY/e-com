import dotenv from 'dotenv';
dotenv.config();

import {auth} from 'express-oauth2-jwt-bearer'



export const jwtCheck = auth({
  audience: 'e-com',
  issuerBaseURL: 'https://dev-3nurd80vhso7rxtr.us.auth0.com/',
  tokenSigningAlg: 'RS256',
});
