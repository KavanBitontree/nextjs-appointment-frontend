/**
 * Zod schemas for profile validation
 */

import { z } from "zod";

export const doctorProfileUpdateSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must not exceed 100 characters")
      .regex(
        /^[a-zA-Z\s.\-']+$/,
        "Name can only contain letters, spaces, dots, hyphens, and apostrophes",
      )
      .optional(),

    speciality: z
      .string()
      .min(2, "Speciality must be at least 2 characters")
      .max(100, "Speciality must not exceed 100 characters")
      .optional(),

    opd_fees: z
      .number()
      .min(0, "OPD fees cannot be negative")
      .max(100000, "OPD fees seems too high")
      .optional(),

    minimum_slot_duration: z
      .number()
      .refine(
        (val) => [0.25, 0.5, 1, 1.5, 2, 3, 4].includes(val),
        "Slot duration must be 15min, 30min, 1h, 1.5h, 2h, 3h, or 4h",
      )
      .optional(),

    address: z
      .string()
      .min(5, "Address must be at least 5 characters")
      .max(500, "Address must not exceed 500 characters")
      .optional(),

    latitude: z
      .number()
      .min(-90, "Invalid latitude")
      .max(90, "Invalid latitude")
      .optional(),

    longitude: z
      .number()
      .min(-180, "Invalid longitude")
      .max(180, "Invalid longitude")
      .optional(),
  })
  .refine(
    (data) => {
      // If any location field is present, all must be present
      const hasAddress = data.address !== undefined;
      const hasLat = data.latitude !== undefined;
      const hasLon = data.longitude !== undefined;

      if (hasAddress || hasLat || hasLon) {
        return hasAddress && hasLat && hasLon;
      }
      return true;
    },
    {
      message:
        "When updating location, address, latitude, and longitude must all be provided",
    },
  );

export const patientProfileUpdateSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .regex(
      /^[a-zA-Z\s.\-']+$/,
      "Name can only contain letters, spaces, dots, hyphens, and apostrophes",
    )
    .optional(),

  dob: z
    .string()
    .refine(
      (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();

        // Must be a valid date
        if (isNaN(date.getTime())) return false;

        // Must be in the past
        if (date >= now) return false;

        // Calculate age
        const age =
          now.getFullYear() -
          date.getFullYear() -
          (now.getMonth() < date.getMonth() ||
          (now.getMonth() === date.getMonth() && now.getDate() < date.getDate())
            ? 1
            : 0);

        // Must be at least 1 year old and less than 150
        return age >= 1 && age <= 150;
      },
      {
        message: "Invalid date of birth (must be in the past, age 1-150 years)",
      },
    )
    .optional(),
});

export type DoctorProfileUpdateFormData = z.infer<
  typeof doctorProfileUpdateSchema
>;
export type PatientProfileUpdateFormData = z.infer<
  typeof patientProfileUpdateSchema
>;
