import { createHash, randomUUID } from "node:crypto";
import { POLICY_ID, POLICY_VERSION } from "./gate.js";

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value).sort().map((key) => [key, canonicalize(value[key])])
    );
  }
  return value;
}

export function sha256Json(value) {
  const canonical = JSON.stringify(canonicalize(value));
  return `sha256:${createHash("sha256").update(canonical).digest("hex")}`;
}

export function createReceipt(input, evaluation, now = new Date()) {
  return {
    receipt_id: randomUUID(),
    receipt_type: "jp-copyright-30-4-gate-receipt",
    created_at: now.toISOString(),
    jurisdiction: "JP",
    policy: {
      id: POLICY_ID,
      version: POLICY_VERSION,
      legal_basis: "Japan Copyright Act Article 30-4"
    },
    input_hash: sha256Json(input),
    decision: evaluation.decision,
    basis: evaluation.basis,
    findings: evaluation.findings,
    evidence_refs: input?.evidence?.refs ?? [],
    source_record: input?.source ?? null,
    provenance_manifest: input?.provenance ?? null,
    disclaimer: evaluation.disclaimer
  };
}
