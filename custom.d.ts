declare namespace Express {
  export interface Request {
    isAuthenticated?: boolean;
    userId?: string,
  }
}


