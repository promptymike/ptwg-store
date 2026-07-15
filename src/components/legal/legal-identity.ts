export type LegalIdentity = {
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  supportEmail: string;
};

export function legalSellerName(identity: LegalIdentity) {
  return identity.businessName.trim() || "Templify";
}

export function legalSellerContactLine(identity: LegalIdentity) {
  return [
    legalSellerName(identity),
    identity.businessAddress.trim() || null,
    `e-mail: ${identity.supportEmail}`,
    identity.businessPhone.trim() ? `tel.: ${identity.businessPhone}` : null,
  ]
    .filter(Boolean)
    .join(", ");
}
