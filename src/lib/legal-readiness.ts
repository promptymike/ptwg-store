type SellerIdentity = {
  businessName: string | null | undefined;
  businessAddress: string | null | undefined;
  businessPhone: string | null | undefined;
};

export function hasCompleteSellerIdentity(identity: SellerIdentity) {
  return (
    (identity.businessName?.trim().length ?? 0) >= 3 &&
    (identity.businessAddress?.trim().length ?? 0) >= 8 &&
    (identity.businessPhone?.replace(/\D/g, "").length ?? 0) >= 7
  );
}
