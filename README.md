# jp-copyright-30-4-gate

A small, deterministic **policy-as-code gate + auditable receipt** for Japan Copyright Act Article 30-4.

> **Know the source. Apply the gate. Keep the receipt.**

This repository does **not** answer “Did an AI learn from my work?” and does not discover, disclose, or prove the actual training data of any specific AI model. It evaluates facts supplied to it and is designed to make **future data ingestion more answerable and auditable**.

日本語版: [README.ja.md](README.ja.md)

## Why this exists

Japanese AI/copyright guidance is written for human legal analysis. Engineering teams still need a narrow executable layer between guidance and data ingestion.

This project implements:

```text
source / provenance facts
        -> normalize
        -> Article 30-4 gate
           -> AUTO / REVIEW / DENY
        -> receipt
           -> policy version
           -> findings
           -> evidence refs
           -> source + provenance record
           -> canonical SHA-256 input hash
```

## Decision semantics

- **AUTO** — the supplied facts satisfy this narrow Article 30-4 profile, or Article 30-4 is not needed under the declared scope.
- **REVIEW** — at least one material fact or legal characterization is unresolved.
- **DENY** — this profile cannot authorize the use under Article 30-4 on the supplied facts.

**DENY does not mean “illegal”.** Permission, another exception, or another legal basis may still apply.

## Encoded statutory structure

The implementation models Article 30-4 as **three statutory layers**:

1. **Non-enjoyment purpose** for the target work.
   - A coexisting enjoyment purpose means this layer is not satisfied.
   - Intentional output of protected creative expression is a specific signal within this layer.
2. **Necessary extent**.
3. **No unreasonable prejudice** to the copyright holder's interests.

“Information analysis” is recorded as a statutory example of non-enjoyment use, not as the only possible Article 30-4 case.

### Similar-output signals

The gate deliberately separates these cases:

- An **isolated/incidental output** sharing creative expression with a learned work is informational only; by itself it does not establish training-stage enjoyment purpose.
- **Markedly frequent outputs** sharing creative expression can be an indirect fact relevant to training-stage purpose and therefore route to **REVIEW**.
- If that frequency is stated to result from **users intentionally prompting for similar works**, it is recorded as informational rather than treated as evidence of the trainer's enjoyment purpose.

The signal concerns **protected creative expression**, not mere similarity of an unprotected “style” or idea.

## Provenance

`source` is a compact acquisition record retained for compatibility. v0.1.2 also accepts an optional `provenance` manifest with fields such as content hash, source URI, acquisition time/method, source type, collector, declared license, rights-holder claim, and retrieval receipt.

The gate **preserves** provenance in the receipt. It does **not independently verify** that provenance is true, and missing provenance is not silently invented as an Article 30-4 statutory requirement.

See [`docs/provenance.md`](docs/provenance.md).

## Run

Requires Node.js 20+ and no third-party dependencies.

```bash
npm test
npm run gate -- examples/training-auto.json
```

Example output is a receipt containing the decision, individual findings, policy version, source/provenance record, evidence references, and a canonical SHA-256 hash of the complete input.

## Example input

```json
{
  "scope": {
    "copyrighted_work": true,
    "copyright_use_occurs": true
  },
  "conditions": {
    "information_analysis": true,
    "other_non_enjoyment_purpose": false,
    "enjoyment_of_target_work": false,
    "coexisting_enjoyment_purpose": false,
    "intentional_reproduction_output_purpose": false,
    "within_necessary_extent": true,
    "unreasonably_prejudices_rightsholder": false
  }
}
```

## Examples

- `training-auto.json` — ordinary information-analysis training profile, with provenance record.
- `reproduction-output-deny.json` — intentional output of creative expression contained in the works used.
- `incidental-similar-output-auto.json` — isolated similar-expression output, not dispositive by itself.
- `frequent-common-expression-review.json` — marked frequency requiring purpose review.
- `frequent-user-prompt-attributed-auto.json` — frequency attributed to user similarity prompting.
- `rag-output-deny.json` — RAG/vector database built to output protected creative expression.
- `rag-non-expression-auto.json` — RAG profile stated not to output the source work's creative expression.

## Official sources

- Agency for Cultural Affairs — AI and Copyright: https://www.bunka.go.jp/seisaku/chosakuken/aiandcopyright.html
- “Approach to AI and Copyright” (March 15, 2024): https://www.bunka.go.jp/seisaku/bunkashingikai/chosakuken/pdf/94037901_01.pdf
- Agency for Cultural Affairs — FAQ including LoRA / additional training and RAG examples: https://www.bunka.go.jp/seisaku/bunka_gyosei/kibankyoka/faq/index.html

The Agency's “Approach” expressly notes that it is not legally binding and does not provide a definitive legal evaluation of particular AI systems. Final legal interpretation depends on specific facts and ultimately judicial judgment.

See [`docs/legal-basis.md`](docs/legal-basis.md) for the mapping and [`CHANGELOG.md`](CHANGELOG.md) for policy changes.

## Scope / non-goals

v0.1 is **not** a full Japanese-law compliance engine. It does not decide:

- the actual training dataset of a third-party AI model;
- whether a provenance assertion is true;
- whether the source was lawfully obtained;
- contract / terms-of-service compliance;
- privacy or personal-information law;
- trade-secret law;
- criminal law;
- whether generated output infringes a copyrighted work;
- whether another Copyright Act limitation or exception applies.

Those belong in separate gates. This repository is not legal advice.

## Roadmap

- v0.2: provenance validation + evidence adapters
- v0.3: signed receipts and tamper verification
- v0.4: expanded test vectors for RAG / LoRA / fine-tuning / web crawl
- v0.5: optional OPA/Rego adapter
- later: separate Japanese privacy / contract / trade-secret / acquisition gates

## License

MIT
