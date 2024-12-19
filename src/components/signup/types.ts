import * as z from "zod";

export const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name is required"),
  companyName: z.string().min(2, "Company name is required"),
  industry: z.string().optional(),
  companySize: z.string().optional(),
});

export type FormData = z.infer<typeof formSchema>;