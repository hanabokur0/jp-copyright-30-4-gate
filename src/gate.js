export const POLICY_ID = "jp-copyright-article-30-4";
export const POLICY_VERSION = "0.1.2";

const UNKNOWN = new Set([undefined, null, "unknown"]);
const EXPLICIT_UNKNOWN = new Set([null, "unknown"]);
const isUnknown = (v) => UNKNOWN.has(v);
const isExplicitUnknown = (v) => EXPLICIT_UNKNOWN.has(v);
const isTriState = (v) => v === true || v === false || isUnknown(v);

function finding(code, result, message, legalEffect = "informational") {
  return { code, result, message, legal_effect: legalEffect };
}

/**
 * Evaluates only whether the supplied facts can be auto-routed under the
 * Article 30-4 profile. It does NOT decide overall legality.
 *
 * Decision semantics:
 * AUTO   = provided facts satisfy this profile's Article 30-4 conditions.
 * REVIEW = a material fact or legal characterization is unresolved.
 * DENY   = this profile cannot authorize under Article 30-4 on supplied facts.
 *
 * DENY does not mean the activity is unlawful. Permission, another statutory
 * exception, or a different legal basis may still apply.
 */
export function evaluateArticle30_4(input) {
  const findings = [];
  const conditions = input?.conditions ?? {};
  const scope = input?.scope ?? {};

  // Fail closed to REVIEW on malformed tri-state inputs rather than letting a
  // non-boolean value accidentally fall through a falsey/truthy branch.
  const triStateFields = [
    ["scope.copyrighted_work", scope.copyrighted_work],
    ["scope.copyright_use_occurs", scope.copyright_use_occurs],
    ["conditions.information_analysis", conditions.information_analysis],
    ["conditions.other_non_enjoyment_purpose", conditions.other_non_enjoyment_purpose],
    ["conditions.enjoyment_of_target_work", conditions.enjoyment_of_target_work],
    ["conditions.coexisting_enjoyment_purpose", conditions.coexisting_enjoyment_purpose],
    ["conditions.intentional_reproduction_output_purpose", conditions.intentional_reproduction_output_purpose],
    ["conditions.incidental_similar_output_observed", conditions.incidental_similar_output_observed],
    ["conditions.frequent_common_expression_outputs_observed", conditions.frequent_common_expression_outputs_observed],
    ["conditions.frequent_outputs_attributable_to_user_similarity_prompts", conditions.frequent_outputs_attributable_to_user_similarity_prompts],
    ["conditions.within_necessary_extent", conditions.within_necessary_extent],
    ["conditions.unreasonably_prejudices_rightsholder", conditions.unreasonably_prejudices_rightsholder]
  ];
  const invalidFields = triStateFields.filter(([, value]) => !isTriState(value));
  if (invalidFields.length > 0) {
    for (const [path, value] of invalidFields) {
      findings.push(finding(
        "INVALID_TRISTATE_INPUT",
        "UNKNOWN",
        `${path} must be true, false, null, "unknown", or omitted; received ${JSON.stringify(value)}.`,
        "material_fact_required"
      ));
    }
    return finalize("REVIEW", "INVALID_INPUT", findings);
  }

  if (scope.copyrighted_work === false) {
    findings.push(finding(
      "OUTSIDE_COPYRIGHTED_WORK_SCOPE",
      "PASS",
      "Input states that the target is not a copyrighted work; Article 30-4 authorization is not needed under this profile."
    ));
    return finalize("AUTO", "OUT_OF_SCOPE", findings);
  }

  if (scope.copyright_use_occurs === false) {
    findings.push(finding(
      "NO_RELEVANT_COPYRIGHT_USE",
      "PASS",
      "Input states that no relevant use of a copyrighted work occurs; Article 30-4 authorization is not needed under this profile."
    ));
    return finalize("AUTO", "OUT_OF_SCOPE", findings);
  }

  if (isUnknown(scope.copyrighted_work)) {
    findings.push(finding(
      "COPYRIGHTED_WORK_SCOPE_UNKNOWN",
      "UNKNOWN",
      "Whether the target is a copyrighted work is unresolved.",
      "material_fact_required"
    ));
  }
  if (isUnknown(scope.copyright_use_occurs)) {
    findings.push(finding(
      "COPYRIGHT_USE_SCOPE_UNKNOWN",
      "UNKNOWN",
      "Whether a relevant copyright use occurs is unresolved.",
      "material_fact_required"
    ));
  }

  // Statutory layer 1: non-enjoyment purpose with respect to the target work.
  if (conditions.enjoyment_of_target_work === true) {
    findings.push(finding(
      "ENJOYMENT_PURPOSE_PRESENT",
      "FAIL",
      "A purpose of enjoying the ideas or emotions expressed in the target work is present.",
      "article_30_4_unavailable_on_supplied_facts"
    ));
  } else if (isUnknown(conditions.enjoyment_of_target_work)) {
    findings.push(finding(
      "ENJOYMENT_PURPOSE_UNKNOWN",
      "UNKNOWN",
      "Whether enjoyment of the target work is a purpose is unresolved.",
      "material_fact_required"
    ));
  } else {
    findings.push(finding(
      "NON_ENJOYMENT_PURPOSE",
      "PASS",
      "No enjoyment purpose for the target work is stated."
    ));
  }

  // Subcheck within statutory layer 1: coexisting enjoyment purpose.
  //
  // The Agency for Cultural Affairs' "Approach to AI and Copyright"
  // (Mar. 15, 2024), pp.19-21, gives examples where an additional-training
  // or database-building use intentionally aims to output the whole or part
  // of creative expression contained in the works used. That specific signal
  // is checked first. The general field remains a manual fallback for other
  // coexisting-enjoyment fact patterns.
  //
  // Backward compatibility: omission of the optional specific signal does not
  // by itself create REVIEW when the required general fallback is false. An
  // explicit null/"unknown" does create REVIEW, preserving the safety rule
  // that stated uncertainty is not silently converted into AUTO.
  const intentionalOutputPurpose = conditions.intentional_reproduction_output_purpose;
  const generalCoexistingPurpose = conditions.coexisting_enjoyment_purpose;

  if (intentionalOutputPurpose === true) {
    findings.push(finding(
      "INTENTIONAL_REPRODUCTION_OUTPUT_PURPOSE",
      "FAIL",
      "The use intentionally aims for a model or derived database to later output the whole or part of creative expression contained in the works used; this is treated as a coexisting enjoyment purpose under this profile.",
      "article_30_4_unavailable_on_supplied_facts"
    ));
  } else if (generalCoexistingPurpose === true) {
    findings.push(finding(
      "COEXISTING_ENJOYMENT_PURPOSE",
      "FAIL",
      "An enjoyment purpose coexists with the non-enjoyment purpose.",
      "article_30_4_unavailable_on_supplied_facts"
    ));
  } else if (isUnknown(generalCoexistingPurpose) || isExplicitUnknown(intentionalOutputPurpose)) {
    findings.push(finding(
      "COEXISTING_PURPOSE_UNKNOWN",
      "UNKNOWN",
      "Whether an enjoyment purpose coexists is unresolved.",
      "material_fact_required"
    ));
  } else {
    findings.push(finding(
      "NO_COEXISTING_ENJOYMENT_PURPOSE",
      "PASS",
      "No coexisting enjoyment purpose is stated."
    ));
  }

  // A single post-training output sharing creative expression with a learned
  // work does not, by itself, establish enjoyment purpose at training time.
  // The Agency also notes that markedly frequent outputs sharing creative
  // expression can be an indirect fact supporting an inference about purpose,
  // except where the frequency is attributable to users intentionally prompting
  // for similar works. We therefore separate isolated and frequent observations.
  const frequentCommonExpression = conditions.frequent_common_expression_outputs_observed;
  const userPromptAttribution = conditions.frequent_outputs_attributable_to_user_similarity_prompts;

  if (frequentCommonExpression === true) {
    if (userPromptAttribution === true) {
      findings.push(finding(
        "FREQUENT_COMMON_EXPRESSION_OUTPUTS_USER_PROMPT_ATTRIBUTED",
        "INFO",
        "Outputs sharing creative expression with learned works are stated to occur frequently, but that frequency is attributed to users intentionally prompting for similar works; under the cited Agency guidance, this fact does not by itself support an inference that the trainer had an enjoyment purpose.",
        "informational"
      ));
    } else {
      findings.push(finding(
        "FREQUENT_COMMON_EXPRESSION_OUTPUTS_REVIEW",
        "WARN",
        userPromptAttribution === false
          ? "Outputs sharing creative expression with learned works are stated to occur markedly frequently and are not attributed to users intentionally prompting for similar works. The Agency identifies such frequency as one possible indirect fact when inferring training-stage purpose; manual review is required."
          : "Outputs sharing creative expression with learned works are stated to occur markedly frequently, but attribution to user prompting is unresolved. The Agency identifies such frequency as one possible indirect fact when inferring training-stage purpose; manual review is required.",
        "manual_review_required"
      ));
    }
  } else if (conditions.incidental_similar_output_observed === true) {
    findings.push(finding(
      "INCIDENTAL_SIMILAR_OUTPUT_NOT_DISPOSITIVE",
      "INFO",
      "A generation-stage output sharing creative expression with a learned work was observed, but this fact alone does not establish an enjoyment purpose at the training stage and does not by itself defeat Article 30-4 under this profile.",
      "informational"
    ));
  }

  // Information analysis is an important exemplar, but Article 30-4 is broader
  // than information analysis. Record it without making it a mandatory element.
  if (conditions.information_analysis === true) {
    findings.push(finding(
      "INFORMATION_ANALYSIS",
      "PASS",
      "The stated purpose includes information analysis, a statutory example of non-enjoyment use."
    ));
  } else if (conditions.other_non_enjoyment_purpose === true) {
    findings.push(finding(
      "OTHER_NON_ENJOYMENT_PURPOSE",
      "PASS",
      "A non-enjoyment purpose other than information analysis is stated."
    ));
  } else if (conditions.information_analysis === false && conditions.other_non_enjoyment_purpose === false) {
    findings.push(finding(
      "NON_ENJOYMENT_BASIS_NOT_IDENTIFIED",
      "UNKNOWN",
      "No affirmative non-enjoyment basis is identified; human review is required.",
      "material_fact_required"
    ));
  }

  // Statutory layer 2: necessary extent.
  if (conditions.within_necessary_extent === false) {
    findings.push(finding(
      "EXCEEDS_NECESSARY_EXTENT",
      "FAIL",
      "The use is stated to exceed the extent considered necessary for the purpose.",
      "article_30_4_unavailable_on_supplied_facts"
    ));
  } else if (isUnknown(conditions.within_necessary_extent)) {
    findings.push(finding(
      "NECESSARY_EXTENT_UNKNOWN",
      "UNKNOWN",
      "Whether the use stays within the necessary extent is unresolved.",
      "material_fact_required"
    ));
  } else {
    findings.push(finding(
      "WITHIN_NECESSARY_EXTENT",
      "PASS",
      "The use is stated to remain within the extent considered necessary."
    ));
  }

  // Statutory layer 3: proviso on unreasonable prejudice to rights-holder interests.
  if (conditions.unreasonably_prejudices_rightsholder === true) {
    findings.push(finding(
      "UNREASONABLE_PREJUDICE_PRESENT",
      "FAIL",
      "The use is stated to unreasonably prejudice the interests of the copyright holder.",
      "article_30_4_unavailable_on_supplied_facts"
    ));
  } else if (isUnknown(conditions.unreasonably_prejudices_rightsholder)) {
    findings.push(finding(
      "RIGHTSHOLDER_PREJUDICE_UNKNOWN",
      "UNKNOWN",
      "Whether the use unreasonably prejudices the copyright holder's interests is unresolved.",
      "material_fact_required"
    ));
  } else {
    findings.push(finding(
      "NO_UNREASONABLE_PREJUDICE_STATED",
      "PASS",
      "No unreasonable prejudice to the copyright holder's interests is stated."
    ));
  }

  // Evidence signals are recorded, not treated as invented standalone statutory elements.
  const evidence = input?.evidence ?? {};
  if (evidence.known_pirated_source === true) {
    findings.push(finding(
      "KNOWN_PIRATED_SOURCE_SIGNAL",
      "WARN",
      "A known-pirated-source signal is present. This profile does not treat source status as a standalone Article 30-4 element, but it may be highly relevant to other law, contract, acquisition policy, and the prejudice analysis.",
      "review_external_legal_basis"
    ));
  }
  if (evidence.ai_training_market_dataset === true) {
    findings.push(finding(
      "TRAINING_DATASET_MARKET_SIGNAL",
      "WARN",
      "The source is stated to be a dataset marketed for AI training. Assess whether the use conflicts with a rights-holder market or potential market and therefore bears on the unreasonable-prejudice analysis.",
      "review_prejudice_analysis"
    ));
  }

  const failed = findings.some((f) => f.result === "FAIL");
  const unknown = findings.some((f) => f.result === "UNKNOWN");
  const manualReview = findings.some((f) => f.legal_effect === "manual_review_required");

  if (failed) return finalize("DENY", "ARTICLE_30_4_NOT_AVAILABLE", findings);
  if (unknown || manualReview) return finalize("REVIEW", "FACTS_OR_CHARACTERIZATION_REQUIRE_REVIEW", findings);
  return finalize("AUTO", "ARTICLE_30_4_PROFILE_SATISFIED", findings);
}

function finalize(decision, basis, findings) {
  return {
    policy_id: POLICY_ID,
    policy_version: POLICY_VERSION,
    decision,
    basis,
    findings,
    disclaimer:
      "This is a deterministic routing result under a narrow Article 30-4 policy profile, not a legal opinion or a conclusion that an activity is lawful or unlawful. It evaluates supplied facts and does not discover or prove the training data of any AI model."
  };
}
