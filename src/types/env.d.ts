declare namespace NodeJS {
  interface ProcessEnv {
    SESSION_SECRET: string;
    ENCRYPTION_KEY: string;
  }
}
