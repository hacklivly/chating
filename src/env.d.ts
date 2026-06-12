/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    userId: string | null;
  }
}

interface ImportMetaEnv {
  readonly MONGODB_URI: string;
  readonly JWT_SECRET: string;
  readonly CLOUDINARY_CLOUD_NAME: string;
  readonly CLOUDINARY_API_KEY: string;
  readonly CLOUDINARY_API_SECRET: string;
  readonly GIPHY_API_KEY: string;
}
