const DEFAULT_DOMAINS = ["sti.edu.ph", "student.sti.edu.ph"];

function getRawDomainConfig() {
  if (typeof window === "undefined") {
    return (
      process.env.STI_EMAIL_DOMAINS ||
      process.env.NEXT_PUBLIC_STI_EMAIL_DOMAINS ||
      DEFAULT_DOMAINS.join(",")
    );
  }

  return process.env.NEXT_PUBLIC_STI_EMAIL_DOMAINS || DEFAULT_DOMAINS.join(",");
}

export function getAllowedStudentEmailDomains() {
  return getRawDomainConfig()
    .split(",")
    .map((domain) => domain.trim().toLowerCase().replace(/^@/, ""))
    .filter(Boolean);
}

export function getStudentEmailDomainHint() {
  const domains = getAllowedStudentEmailDomains();
  return domains.length ? domains.map((domain) => `@${domain}`).join(", ") : "@sti.edu.ph";
}

export function isAllowedStudentEmail(email = "") {
  const normalizedEmail = String(email).trim().toLowerCase();
  const [, domain = ""] = normalizedEmail.split("@");

  if (!normalizedEmail || !domain) return false;

  return getAllowedStudentEmailDomains().some(
    (allowedDomain) =>
      domain === allowedDomain || domain.endsWith(`.${allowedDomain}`)
  );
}

export function isProtectedStudentPath(pathname = "") {
  const protectedPrefixes = [
    "/forum",
    "/leaderboards",
    "/payments",
    "/profile",
    "/programs",
  ];

  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function buildJoinRedirect(pathname = "/", search = "") {
  const next = `${pathname || "/"}${search || ""}`;
  const params = new URLSearchParams();
  params.set("next", next);
  return `/join?${params.toString()}`;
}
