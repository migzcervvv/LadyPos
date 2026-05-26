export function normalizePHPhone(phone) {
  if (!phone) return "";

  // remove all non-digit chars except +
  let cleaned = phone.trim().replace(/[^\d+]/g, "");

  // convert 09xxxxxxxxx -> +639xxxxxxxxx
  if (/^09\d{9}$/.test(cleaned)) {
    return "+63" + cleaned.slice(1);
  }

  // convert 639xxxxxxxxx -> +639xxxxxxxxx
  if (/^639\d{9}$/.test(cleaned)) {
    return "+" + cleaned;
  }

  // already valid
  if (/^\+639\d{9}$/.test(cleaned)) {
    return cleaned;
  }

  return cleaned;
}

export function isValidPHPhone(phone) {
  return /^\+639\d{9}$/.test(phone);
}
