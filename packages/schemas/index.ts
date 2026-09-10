import { z } from "zod";

export const propertySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  published: z.boolean(),
  ownerId: z.string(),
});

// The API returns an array of these
export const propertyListSchema = z.array(propertySchema);

export type Property = z.infer<typeof propertySchema>;

// The payload a user sends to create an enquiry
export const createEnquirySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  message: z.string().min(1, "Message is required"),
});

export type CreateEnquiry = z.infer<typeof createEnquirySchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export type Login = z.infer<typeof loginSchema>;

export const enquirySchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  message: z.string(),
  propertyId: z.string(),
});

export const enquiryListSchema = z.array(enquirySchema);