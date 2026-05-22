export function getAdminEmail() {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase() || "";
}

export function isAdminEmail(email: string | null | undefined) {
  const adminEmail = getAdminEmail();

  return Boolean(adminEmail && email && email.trim().toLowerCase() === adminEmail);
}
