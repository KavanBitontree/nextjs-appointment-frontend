import { z } from "zod";

export const patientSignupSchema = z
  .object({
    email: z.string().email("Enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Add at least one uppercase letter")
      .regex(/[0-9]/, "Add at least one number")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "Add one special character"),
    confirm_password: z.string(),
    name: z.string().min(2, "Name is required"),
    dob: z.string().min(1, "Date of birth is required"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  })
  .refine(
    (data) => {
      if (!data.dob) return false;
      const dobDate = new Date(data.dob);
      const today = new Date();
      return dobDate <= today;
    },
    {
      message: "Date of birth cannot be in the future",
      path: ["dob"],
    },
  );

export type PatientSignupFormData = z.infer<typeof patientSignupSchema>;
