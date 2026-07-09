import { getPwaShortName } from "./branding-image";

export function buildEmailBrandingHeader(options: {
  companyName: string;
  logoUrl?: string;
}) {
  if (!options.logoUrl) return "";
  return `<p style="margin:0 0 20px"><img src="${options.logoUrl}" alt="${options.companyName}" style="max-height:56px;max-width:220px;height:auto;width:auto" /></p>`;
}

export function buildEmailSignature(companyName: string) {
  return `<p>Herzliche Grüße,<br>Ihr ${companyName}-Team</p>`;
}

export function buildEmailFromAddress(companyName: string, fromEmail: string) {
  const short = getPwaShortName(companyName);
  return `${short} <${fromEmail}>`;
}
