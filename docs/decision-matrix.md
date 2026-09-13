# Decision matrix

This repository deliberately distinguishes **policy routing** from a court's legal conclusion.

## Statutory layers

| Layer / condition | AUTO-side fact | REVIEW | DENY-side fact |
|---|---|---|---|
| Non-enjoyment: target-work enjoyment purpose | `false` | `unknown` | `true` |
| Non-enjoyment: intentional output of creative expression | `false` or omitted with general fallback resolved | explicit `unknown` | `true` |
| Non-enjoyment: general coexisting enjoyment purpose | `false` | `unknown` | `true` |
| Necessary extent | `true` | `unknown` | `false` |
| Unreasonable prejudice | `false` | `unknown` | `true` |

A `DENY` means **“do not auto-authorize on Article 30-4 under this profile.”** It does not mean the activity is unlawful. A license, consent, another copyright exception, or another legal basis may apply.

## Indirect / evidence signals

| Signal | Result | Decision effect |
|---|---|---|
| Isolated generation-stage output sharing creative expression with a learned work | `INFO` | none by itself |
| Markedly frequent outputs sharing creative expression, not attributed to user similarity prompts | `WARN` | `REVIEW` |
| Same marked frequency, attribution to user similarity prompts unresolved | `WARN` | `REVIEW` |
| Same marked frequency, explicitly attributed to user similarity prompts | `INFO` | none by itself |
| Known-pirated-source signal | `WARN` | no independent Article 30-4 effect |
| Dataset marketed for AI training | `WARN` | no independent effect; informs unreasonable-prejudice analysis |

Marked frequency is treated as **indirect evidence**, not a conclusive finding of enjoyment purpose. It therefore routes to REVIEW rather than DENY.

The user-prompt attribution signal does not override an independently stated `intentional_reproduction_output_purpose` or `coexisting_enjoyment_purpose`.

## Explicit non-goals

This v0.1 profile does not decide:

- the actual training data of a third-party model;
- whether a provenance assertion is true;
- whether the source was lawfully obtained;
- contract / terms-of-service compliance;
- privacy or personal-information law;
- trade-secret law;
- criminal law;
- whether generated output infringes a copyrighted work;
- whether another Copyright Act limitation or exception applies.

These should be separate gates rather than silently folded into Article 30-4.
