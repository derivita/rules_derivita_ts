import { AllowlistEntry, ExemptionReason } from '../allowlist';
import { TRUSTED_TYPES_RELATED_RULES } from './rule_groups';

const litExemption: AllowlistEntry = {
  reason: ExemptionReason.MANUALLY_REVIEWED,
  explanation: 'Lit should be reviewed by Google.',
  regexp: ['/third_party/lit/packages/lit-html/src/lit-html.ts$'],
};
const safevaluesExemption: AllowlistEntry = {
  reason: ExemptionReason.MANUALLY_REVIEWED,
  explanation: 'SafeValues should be reviewed by Google.',
  regexp: ['/third_party/safevalues/src/.+\\.ts$'],
};
const litGoogleChartExemption: AllowlistEntry = {
  reason: ExemptionReason.MANUALLY_REVIEWED,
  explanation: 'lit-google-chart should be reviewed by Google.',
  regexp: ['/third_party/lit-google-chart/loader\\.ts$'],
};
const materialExemption: AllowlistEntry = {
  reason: ExemptionReason.MANUALLY_REVIEWED,
  explanation: 'Material should be reviewed by Google.',
  regexp: ['/third_party/material/mwc/.+\\.ts$'],
};
const testExemption: AllowlistEntry = {
  reason: ExemptionReason.LEGACY,
  explanation: 'Tests should have no prod impact',
  regexp: ['[_.]test\\.ts$'],
}
const jsxExemption: AllowlistEntry = {
  reason: ExemptionReason.MANUALLY_REVIEWED,
  explanation: 'JSX runs inside the sandboxed iframe.',
  regexp: ['omaha/sandbox/v2/subject/jsx/.+\\.ts$'],
}

// Any changes here need a security review.
const exemptions: { [ruleName: string]: AllowlistEntry[] } = {
  'ban-base-href-assignments': [safevaluesExemption],
  'ban-document-execcommand': [safevaluesExemption],
  'ban-document-write-calls': [safevaluesExemption, {
    reason: ExemptionReason.LEGACY,
    explanation: 'String constant used for doc window.',
    regexp: ['omaha/sandbox/v2/subject/geometry/control_overlay\\.ts'],
  }],
  'ban-domparser-parsefromstring': [safevaluesExemption],
  'ban-element-innerhtml-assignments': [litExemption, safevaluesExemption, testExemption],
  'ban-element-outerhtml-assignments': [safevaluesExemption],
  'ban-element-setattribute': [
    litExemption,
    safevaluesExemption,
    materialExemption,
    jsxExemption,
  ],
  'ban-eval-calls': [safevaluesExemption, jsxExemption],
  'ban-function-calls': [
    {
      reason: ExemptionReason.MANUALLY_REVIEWED,
      explanation:
        'Dynamically generated code was security reviewed and is used on sandbox origin.',
      regexp: ['/sandbox/plotting\\.ts$'],
    },
  ],
  'ban-iframe-srcdoc-assignments': [safevaluesExemption],
  'ban-legacy-conversion': [
    {
      reason: ExemptionReason.LEGACY,
      explanation: 'Allow author-specified url for passage iframe. This should be hard to abuse because teachers are unlikely to attack their students.',
      regexp: ['/sandbox/main\\.ts$'],
    },
  ],
  'ban-object-data-assignments': [safevaluesExemption],
  'ban-range-createcontextualfragment': [safevaluesExemption],
  'ban-reviewed-conversions': [
    {
      reason: ExemptionReason.MANUALLY_REVIEWED,
      explanation: 'Code is executed inside the sandbox.',
      regexp: ['/sandbox/main\\.ts$'],
    },
  ],
  'ban-script-content-assignments': [safevaluesExemption],
  'ban-script-src-assignments': [litGoogleChartExemption, safevaluesExemption],
  'ban-serviceworkercontainer-register': [safevaluesExemption],
  'ban-shared-worker-calls': [safevaluesExemption],
  'ban-trustedtypes-createpolicy': [
    litExemption,
    safevaluesExemption,
    litGoogleChartExemption,
  ],
  'ban-worker-calls': [safevaluesExemption],
  'ban-worker-importscripts': [safevaluesExemption],
};

export const DERIVITA_TSEC_RULES = TRUSTED_TYPES_RELATED_RULES.map(
  (rule) => new rule({ allowlistEntries: exemptions[rule.RULE_NAME] })
);
