// lib/sanityServer.ts
import  { createClient } from "@sanity/client";

export const serverClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2026-01-10",
  token: process.env.SANITY_WRITE_TOKEN, // write token
  useCdn: false,
});
