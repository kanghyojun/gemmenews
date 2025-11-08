/// <reference types="vinxi/types/client" />

interface ImportMetaEnv {
  DATABASE_URL: string;
  SESSION_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
