import { validateEmail } from "../utils/validators/emailValidator";
import { sanitizeText } from "../utils/validators/inputSanitizer";
import { validatePassword } from "../utils/validators/passwordValidator";

export const validationService = {
  sanitizeText,
  validateEmail,
  validatePassword,
};
