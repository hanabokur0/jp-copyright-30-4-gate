# Legal basis and design mapping

## Sources

This project intentionally relies on primary Agency for Cultural Affairs materials rather than treating commentary or social-media summaries as legal rules.

1. **Agency for Cultural Affairs — AI and Copyright**
   - https://www.bunka.go.jp/seisaku/chosakuken/aiandcopyright.html
2. **Cultural Council, Copyright Subdivision — “Approach to AI and Copyright” (March 15, 2024)**
   - https://www.bunka.go.jp/seisaku/bunkashingikai/chosakuken/pdf/94037901_01.pdf
3. **Agency for Cultural Affairs — FAQ on legal issues in cultural and artistic activities, including additional training / LoRA and RAG examples**
   - https://www.bunka.go.jp/seisaku/bunka_gyosei/kibankyoka/faq/index.html

The Agency's “Approach” states that it is not legally binding and does not itself give a definitive legal evaluation of a particular AI system. This repository therefore implements a routing profile, not a legal judgment.

**Source review status:** checked against the Agency's current AI-and-copyright materials page and FAQ on 2026-09-13. The current Agency page continues to identify the March 15, 2024 “Approach” and related guidance as the central published materials for this issue.

## Three statutory layers

The gate models the operative Article 30-4 structure as three layers:

1. **Non-enjoyment purpose** — the use must not be for enjoying, or causing another person to enjoy, the ideas or emotions expressed in the target work. A coexisting enjoyment purpose means this layer is not met.
2. **Necessary extent** — the use must remain within the extent considered necessary for the purpose.
3. **No unreasonable prejudice** — the proviso excludes uses that, considering the type/use of the work and manner of use, unreasonably prejudice the copyright holder's interests.

“Information analysis” is a statutory example of non-enjoyment use, not the sole route to Article 30-4.

## Coexisting enjoyment purpose: intentional output of creative expression

The Agency's “Approach” pp.19-21 gives examples of AI-development/training uses where a non-enjoyment purpose can coexist with an enjoyment purpose. The key example is additional training, including collection/processing of training data, **intentionally aimed at having the system output all or part of creative expression contained in the works used**. It also identifies database/vectorization for a system intended to output such creative expression.

This is encoded as:

`conditions.intentional_reproduction_output_purpose`

The name is an engineering label. The operative concept is **creative expression contained in the works used**, not “style” as such. The same Agency document separately notes that style, insofar as it remains at the level of an idea, is not protected merely because it is shared. The expression/idea boundary is fact-specific.

The broader field:

`conditions.coexisting_enjoyment_purpose`

is retained as a manual fallback for fact patterns not captured by the narrower signal.

### Missing vs explicitly unknown

For backward compatibility, omission of the optional specific signal does not by itself force REVIEW when the required general fallback is `false`. However, an explicit `null` or `"unknown"` means the operator has declared uncertainty and therefore routes to REVIEW. This follows the repository invariant: **do not convert stated uncertainty into AUTO**.

## Post-training outputs: isolated event vs marked frequency

The Agency's “Approach” p.21 distinguishes two situations.

### Isolated / incidental observation

A generation/use-stage example sharing creative expression with a learned work does **not, by that fact alone**, normally establish that an enjoyment purpose existed at the development/training stage. It therefore does not automatically defeat Article 30-4.

Encoded as:

`conditions.incidental_similar_output_observed`

This produces an `INFO` finding only.

### Markedly frequent common-expression outputs

The Agency also states that **markedly frequent generation** of outputs sharing creative expression with learned works can be one element when inferring development/training-stage enjoyment purpose. Because this is indirect evidence rather than a conclusive statutory fact, the profile routes the case to **REVIEW**, not DENY.

Encoded as:

`conditions.frequent_common_expression_outputs_observed`

The Agency's footnote further states that, if such frequency is caused by users intentionally prompting the system to generate works similar to existing works, the frequency does not itself support an inference that the AI-training operator had an enjoyment purpose. This is encoded as:

`conditions.frequent_outputs_attributable_to_user_similarity_prompts`

When `true`, the marked frequency is recorded as `INFO` rather than forcing REVIEW. This signal never overrides an independently stated enjoyment purpose.

## RAG

The Agency FAQ and “Approach” distinguish RAG/database preparation according to output purpose:

- If the system is not intended to output the source work's creative expression, Article 30-4 may apply to the preparation/copying activity, subject to the other requirements.
- If the database is built so that the system outputs all or part of the source work's creative expression, the non-enjoyment requirement is not met under the Agency's stated view.

The repository represents this through the same `intentional_reproduction_output_purpose` signal rather than inventing a separate RAG-only legal test.

## Unreasonable prejudice and AI-training datasets

Whether a work is sold or licensed as an AI-training dataset is not encoded as an independent statutory FAIL. It is a `WARN` signal relevant to the separate `unreasonably_prejudices_rightsholder` analysis, including potential conflict with an existing or potential rights-holder market.

`evidence.ai_training_market_dataset = true`

therefore records a warning but does not by itself change AUTO/REVIEW/DENY when the prejudice condition has already been supplied.

## Known-pirated-source signal

`evidence.known_pirated_source` is deliberately not turned into a fabricated standalone Article 30-4 element. It is preserved as a warning because source status can matter to other legal theories, acquisition policy, contractual obligations, and potentially the factual prejudice analysis.

A future acquisition/source-lawfulness gate should handle that question separately.

## Provenance

The gate can preserve an operator-supplied `provenance` manifest in the receipt. Provenance answers a different question from Article 30-4:

- **Provenance:** where did this item come from, when/how was it acquired, and what record/hash was kept?
- **Article 30-4 gate:** on the supplied facts, can this use be routed under this narrow Article 30-4 profile?
- **Receipt:** what facts, policy version, and findings produced the decision?

The presence or absence of provenance is not silently converted into a statutory Article 30-4 element, and the gate does not verify the truth of provenance assertions.

## Legal status

This repository is engineering infrastructure for auditable policy routing. It is not legal advice and does not replace review by qualified counsel or a court.
