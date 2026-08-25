export const isRequired = (value) => {
  return value !== null && value !== undefined && String(value).trim().length > 0;
};

export const isEmail = (value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(value).toLowerCase());
};

export const isMinLength = (value, min) => {
  return String(value).length >= min;
};

export const isPasswordMatch = (pass1, pass2) => {
  return pass1 === pass2;
};

/**
 * Valida un formulario basado en un arreglo de configuraciones de campos
 * @param {Array} fields [{value, rules: {required: true, email: true, minLength: 6}, fieldName: 'Email'}]
 * @returns {Object} {isValid: boolean, errors: Array of strings}
 */
export const validateForm = (fields) => {
  let isValid = true;
  const errors = [];

  fields.forEach(field => {
    const { value, rules, fieldName } = field;

    if (rules.required && !isRequired(value)) {
      isValid = false;
      errors.push(`El campo ${fieldName} es requerido.`);
    }

    if (rules.email && value && !isEmail(value)) {
      isValid = false;
      errors.push(`El formato de correo para ${fieldName} no es válido.`);
    }

    if (rules.minLength && value && !isMinLength(value, rules.minLength)) {
      isValid = false;
      errors.push(`El campo ${fieldName} debe tener al menos ${rules.minLength} caracteres.`);
    }
    
    if (rules.match && value !== rules.match) {
      isValid = false;
      errors.push(`El campo ${fieldName} no coincide.`);
    }
  });

  return { isValid, errors };
};
