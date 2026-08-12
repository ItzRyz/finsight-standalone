export type FieldErrors = Record<string, string>;

export type ActionSuccess<T = undefined> = T extends undefined
  ? {
      success: true;
    }
  : {
      success: true;
      data: T;
    };

export type ActionError = {
  success: false;
  error?: string;
  fieldErrors?: FieldErrors;
};

export type ActionResult<T = undefined> = ActionSuccess<T> | ActionError;
