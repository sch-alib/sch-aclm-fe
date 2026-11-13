import { Box, Typography } from "@mui/material";

import type { Certificate } from "../types";

type RecordValue = Record<string, unknown>;
const object = (value: unknown): RecordValue =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as RecordValue : {};

const text = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() :
  typeof value === "number" ? String(value) : undefined;

const first = (...values: unknown[]): string | undefined =>
  values.map(text).find((value) => value !== undefined);

const date = (value: unknown): string | undefined => {
  const raw = text(value);
  if (!raw) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const timestamp = Date.parse(raw);
  return Number.isNaN(timestamp) ? raw : new Date(timestamp).toLocaleString();
};

const daysUntil = (value: unknown): string | undefined => {
  const raw = text(value);
  if (!raw) return undefined;
  const expires = Date.parse(raw);
  if (Number.isNaN(expires)) return undefined;
  // Date-only expiry uses UTC calendar days; don't shift it into the viewer's timezone.
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const days = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? Math.round((expires - today) / (24 * 60 * 60 * 1000))
    : Math.ceil((expires - Date.now()) / (24 * 60 * 60 * 1000));
  return days < 0 ? `${Math.abs(days)} days overdue` : `${days} days`;
};

const names = (value: unknown): string | undefined => {
  if (!Array.isArray(value)) return text(value);
  const items = value.map((item) => text(item) ?? text(object(item).dns_name) ??
    text(object(item).name)).filter((item): item is string => Boolean(item));
  return items.length ? items.join(", ") : undefined;
};

/** Displays selected certificate metadata only; never renders a CSR or raw CA response. */
export default function CertificateMetadata({
  external, local, orderId,
}: {
  external?: RecordValue;
  local?: Certificate;
  orderId?: string;
}) {
  const order = external ?? {};
  const certificate = object(order.certificate);
  const organization = object(order.organization);
  const product = object(order.product);
  const platform = object(certificate.server_platform);
  const validity = object(order.order_validity);
  const issuer = object(certificate.issuer);
  const remaining = first(certificate.days_remaining, order.days_remaining);
  const expiry = first(certificate.valid_till, certificate.valid_to,
    order.valid_till, order.valid_to, local?.valid_to);
  const sanNames = names(certificate.dns_names) ?? names(order.dns_names) ??
    local?.sans?.split(",").map((name) => name.trim()).filter(Boolean).join(", ");

  const rows: [string, string | undefined][] = [
    ["Common name", first(certificate.common_name, order.common_name, local?.common_name)],
    ["Certificate expires", date(expiry)],
    ["Time remaining", daysUntil(expiry) ?? (remaining ? `${remaining} days` : undefined)],
    ["Valid from", date(first(certificate.valid_from, order.valid_from))],
    ["Subject alternative names (SANs)", sanNames],
    ["Certificate ID", first(certificate.id, order.certificate_id, local?.external_certificate_id)],
    ["DigiCert order ID", first(order.id, order.order_id, orderId, local?.external_order_id)],
    ["DigiCert order status", first(order.status)],
    ["Certificate status", first(certificate.status, local?.status)],
    ["Local record status", local?.status],
    ["Product", first(product.name, order.product, order.product_name, order.product_name_id)],
    ["Organization", first(organization.name, order.organization, order.organization_name)],
    ["Organization ID", first(organization.id, order.organization_id)],
    ["Serial number", first(certificate.serial_number, order.serial_number)],
    ["Issuer", first(issuer.name, issuer.common_name, certificate.issuer, certificate.issuer_name, order.issuer_name)],
    ["Key size", first(certificate.key_size)],
    ["Thumbprint", first(certificate.thumbprint, order.thumbprint, local?.thumbprint)],
    ["Issued", date(first(certificate.date_issued, order.date_issued))],
    ["Order created", date(order.date_created)],
    ["Order validity", first(
      validity.days === undefined ? undefined : `${validity.days} days`,
      validity.years === undefined ? undefined : `${validity.years} years`,
    )],
    ["Server platform", first(platform.name, platform.id)],
    ["Signature hash", first(certificate.signature_hash, order.signature_hash)],
    ["Certificate authority", local?.ca_type ?? (external ? "DigiCert" : undefined)],
  ];

  return (
    <>
      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Certificate and order details</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {external ? "Certificate data from DigiCert; missing values may fall back to the local record."
          : "Local record only; DigiCert details are unavailable."}
      </Typography>
      <Box component="dl" sx={{ display: "grid", gridTemplateColumns: "minmax(170px, 220px) 1fr",
        gap: 1, margin: 0, overflowWrap: "anywhere" }}>
        {rows.map(([label, value]) => (
          <Box key={label} sx={{ display: "contents" }}>
            <Typography component="dt" color="text.secondary">{label}</Typography>
            <Typography component="dd" sx={{ margin: 0 }}>
              {value || "Not available"}
            </Typography>
          </Box>
        ))}
      </Box>
    </>
  );
}
