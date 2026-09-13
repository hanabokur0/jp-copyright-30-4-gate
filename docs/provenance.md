# Provenance manifest

v0.1.2 introduces an **optional, operator-supplied provenance manifest**. Its purpose is to preserve acquisition facts alongside the Article 30-4 receipt so a future ingestion pipeline does not have to reconstruct source history from model behavior.

It does **not** prove that the supplied facts are true and does not discover the training data of a third-party model.

## Suggested fields

```json
{
  "provenance": {
    "schema_version": "0.1",
    "content_hash": "sha256:0123...",
    "source_uri": "https://example.com/item",
    "acquired_at": "2026-09-13T00:00:00Z",
    "acquisition_method": "public-web",
    "source_type": "public_web",
    "collector": "crawler-v0.1",
    "declared_license": null,
    "rights_holder_claim": null,
    "retrieval_receipt": "evidence://source-snapshot/001",
    "parent_refs": []
  }
}
```

## Separation of concerns

```text
provenance          copyright gate             receipt
where/from whom? -> Article 30-4 routing -> what was decided and why?
```

A missing license declaration is a provenance fact, not automatically an Article 30-4 failure. Source-lawfulness, contract/TOS, privacy, trade-secret, and similar questions should be handled by separate gates.

## Receipt behavior

The input's `provenance` object is copied to `provenance_manifest` in the receipt. The receipt's `input_hash` covers the **entire input JSON**, so changing provenance also changes the canonical input hash.
