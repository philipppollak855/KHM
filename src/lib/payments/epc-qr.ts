/** SEPA/EPC-QR (Version 002) für Überweisungen in AT/DE. */
export function buildEpcQrPayload(params: {
  beneficiaryName: string;
  iban: string;
  bic?: string;
  amount: number;
  remittanceText: string;
}): string {
  const iban = params.iban.replace(/\s/g, "").toUpperCase();
  const bic = (params.bic || "").replace(/\s/g, "").toUpperCase();
  const name = params.beneficiaryName.trim().slice(0, 70);
  const amount = params.amount.toFixed(2);
  const remittance = params.remittanceText.trim().slice(0, 140);

  return [
    "BCD",
    "002",
    "1",
    "SCT",
    bic,
    name,
    iban,
    `EUR${amount}`,
    "",
    "",
    remittance,
    "",
  ].join("\n");
}

export function buildPosTransferReference(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `POS-${stamp}-${suffix}`;
}

export function formatIbanDisplay(iban: string): string {
  return iban
    .replace(/\s/g, "")
    .toUpperCase()
    .replace(/(.{4})/g, "$1 ")
    .trim();
}
