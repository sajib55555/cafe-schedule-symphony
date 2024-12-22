import * as z from "zod";

export const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name is required"),
  // Company details
  companyName: z.string().min(2, "Company name is required"),
  companyAddress: z.string().optional(),
  companyPhone: z.string().optional(),
  companyWebsite: z.string().url("Invalid website URL").optional().or(z.literal("")),
  companyDescription: z.string().optional(),
  // Profile details
  position: z.string().min(2, "Position is required"),
  department: z.string().optional(),
  phone: z.string().optional(),
});

export type FormData = z.infer<typeof formSchema>;