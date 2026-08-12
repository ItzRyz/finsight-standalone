import { z } from "zod";

export function getZodErrors(error: z.ZodError) {
  return error.issues.reduce<Record<string, string>>((errors, issue) => {
    const field = issue.path.join(".");

    if (!errors[field]) {
      errors[field] = issue.message;
    }

    return errors;
  }, {});
}
