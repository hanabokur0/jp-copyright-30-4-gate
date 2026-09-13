# Changelog

## 0.1.2

- Reframed Article 30-4 as **three statutory layers** rather than presenting coexisting enjoyment purpose as a separate fourth statutory requirement:
  1. non-enjoyment purpose (including the coexisting-purpose subcheck),
  2. necessary extent,
  3. no unreasonable prejudice to the rights holder.
- Removed misleading style-reproduction wording. The specific purpose signal now consistently refers to intentionally outputting **creative expression contained in the works used**, while the documentation separately notes the Agency's expression/idea distinction.
- Added `conditions.frequent_common_expression_outputs_observed` for the Agency's p.21 marked-frequency scenario. Because frequency is indirect evidence rather than conclusive proof of training-stage purpose, it routes to `REVIEW`, not `DENY`.
- Added `conditions.frequent_outputs_attributable_to_user_similarity_prompts`. When marked frequency is stated to result from users intentionally prompting for similar works, the signal is informational and does not by itself support an inference about the trainer's purpose.
- Preserved the distinction between an isolated similar-expression output (`INFO`) and marked frequency (`REVIEW`).
- Tightened uncertainty handling: an explicitly `null`/`"unknown"` specific coexisting-purpose signal now routes to `REVIEW`; omission remains backward-compatible when the required general fallback is resolved as `false`.
- Added an optional operator-supplied `provenance` manifest and preserve it in receipts as `provenance_manifest`. Provenance is not independently verified and is not made into a new Article 30-4 statutory requirement.
- Added explicit README language that the project does not discover, disclose, or prove a specific AI model's actual training dataset.
- Hardened runtime handling so unknown scope values route to `REVIEW` and malformed tri-state values fail closed to `REVIEW` instead of falling through.
- Added Japanese README, provenance documentation, RAG examples, marked-frequency examples, and expanded regression tests.

## 0.1.1

- Split the coexisting-enjoyment check into two signals:
  - `conditions.intentional_reproduction_output_purpose` — the specific fact pattern from the Agency for Cultural Affairs' “Approach to AI and Copyright” (Mar. 15, 2024), pp.19-21 (training or database-building intentionally aimed at later outputting a work's creative expression). Checked first and dispositive (`FAIL`) when `true`.
  - `conditions.coexisting_enjoyment_purpose` — retained as a general/manual fallback for coexisting-enjoyment fact patterns not covered by the signal above.
- Added `conditions.incidental_similar_output_observed`, an informational-only signal (`INFO` finding) for an isolated generation-stage output sharing creative expression with a learned work without a stated intentional reproduction-output purpose. Per the same Agency source (p.21), this does not by itself defeat Article 30-4.
- Added regression tests and two example inputs.

## 0.1.0

- Initial release.
