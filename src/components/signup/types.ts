import * as z from "zod";

export const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name is required"),
  position: z.string().min(2, "Position is required"),
  department: z.string().optional(),
  phone: z.string().optional(),
});

export type FormData = z.infer<typeof formSchema>;