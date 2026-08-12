import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

import type { FieldErrors } from "@/types/action";

export function setServerErrors<TFieldValues extends FieldValues>(
  setError: UseFormSetError<TFieldValues>,
  fieldErrors?: FieldErrors,
  generalError?: string,
) {
  if (fieldErrors) {
    Object.entries(fieldErrors).forEach(([field, message]) => {
      setError(field as Path<TFieldValues>, {
        type: "server",
        message,
      });
    });
  }

  if (generalError) {
    setError("root.server" as Path<TFieldValues>, {
      type: "server",
      message: generalError,
    });
  }
}
