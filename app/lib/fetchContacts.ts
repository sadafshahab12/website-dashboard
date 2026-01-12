import { client } from "@/sanity/lib/client";
import { Contact } from "../types";

export async function fetchContacts(): Promise<Contact[]> {
  const query = `*[_type == "contact"] | order(_createdAt desc) {
    _id,
    _createdAt,
    name,
    email,
    phone, country,
    subject,
    message
  }`;

  const contacts = await client.fetch<Contact[]>(query);
  return contacts;
}
