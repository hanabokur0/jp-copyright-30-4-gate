# AGENTS.md

## Runtime principle

Observe -> Normalize -> Evaluate -> Gate -> Receipt.

## Safety invariants

1. Do not convert uncertainty into AUTO.
2. Do not label an activity "legal" or "illegal" from this gate.
3. `DENY` means only that this Article 30-4 profile cannot auto-authorize the supplied facts.
4. Preserve evidence references and the exact policy version in every receipt.
5. Never silently add legal requirements that are not part of the encoded profile.
6. Changes to legal rules require a policy-version bump and regression tests.
