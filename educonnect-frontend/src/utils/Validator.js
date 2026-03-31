export const isValidEmail = email => {
  const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return EMAIL_REGEX.test(email.trim());
};

export const isValidPassword = password => {
  if (!password || password.length < 8 || password.length > 16) {
    return false;
  }
  let isSpecial = false;
  let isAlpha = false;
  let isNum = false;
  for (let i = 0; i < password.length; i++) {
    let ascii = password.charCodeAt(i);
    if (ascii >= 48 && ascii <= 57) isNum = true;
    else if ((ascii >= 65 && ascii <= 90) || (ascii >= 97 && ascii <= 122))
      isAlpha = true;
    else isSpecial = true;
  }
  return isAlpha && isNum && isSpecial;
};
