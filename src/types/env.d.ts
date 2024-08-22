declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      MONGODB_URI: string;
      CLIENT_URL: string;
      JWT_SECRET_KEY: string;
      EMAIL: string;
      PASSWORD: string;
    }
  }
}

export {};
