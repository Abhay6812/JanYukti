import {
  FarmerProfile,
  Language,
  RuleCheck,
  Scheme,
  SchemeMatchResult,
} from '../types';

export function getSchemeTitle(scheme: Scheme, lang: Language): string {
  if (lang === 'hi') return scheme.titleHi || scheme.titleEn;
  if (lang === 'mr') return scheme.titleMr || scheme.titleEn;
  return scheme.titleEn;
}

export function getSchemeBenefit(scheme: Scheme, lang: Language): string {
  if (lang === 'hi') return scheme.benefitHi || scheme.benefitEn;
  if (lang === 'mr') return scheme.benefitMr || scheme.benefitEn;
  return scheme.benefitEn;
}

export function getSchemeSummary(scheme: Scheme, lang: Language): string {
  if (lang === 'hi') return scheme.summaryHi || scheme.summaryEn;
  if (lang === 'mr') return scheme.summaryMr || scheme.summaryEn;
  return scheme.summaryEn;
}

export function getSchemeDocuments(scheme: Scheme, lang: Language): string[] {
  if (lang === 'hi') return scheme.documentsHi.length ? scheme.documentsHi : scheme.documentsEn;
  if (lang === 'mr') return scheme.documentsMr.length ? scheme.documentsMr : scheme.documentsEn;
  return scheme.documentsEn;
}

export function getRuleLabel(rule: RuleCheck, lang: Language): string {
  if (lang === 'hi') return rule.labelHi;
  if (lang === 'mr') return rule.labelMr;
  return rule.labelEn;
}

// Client-side Zero-PII scrubbing before any text leaves the browser
export function scrubPiiClient(text: string): { cleaned: string; redacted: boolean } {
  let redacted = false;
  let cleaned = text;

  const aadhaarRegex = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;
  if (aadhaarRegex.test(cleaned)) {
    redacted = true;
    cleaned = cleaned.replace(aadhaarRegex, '[REDACTED-ID]');
  }

  const phoneRegex = /(?:\+91[\s-]?|0)?\b[6-9]\d{9}\b/g;
  if (phoneRegex.test(cleaned)) {
    redacted = true;
    cleaned = cleaned.replace(phoneRegex, '[REDACTED-PHONE]');
  }

  const ifscRegex = /\b[A-Z]{4}0[A-Z0-9]{6}\b/gi;
  if (ifscRegex.test(cleaned)) {
    redacted = true;
    cleaned = cleaned.replace(ifscRegex, '[REDACTED-BANK]');
  }

  return { cleaned, redacted };
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Deterministic, transparent eligibility matcher.
 * Never claims "Guaranteed" — computes explicit rule checks so farmers and judges
 * can inspect every condition behind "Likely Eligible".
 */
export function evaluateSchemes(
  schemes: Scheme[],
  profile: FarmerProfile | null
): SchemeMatchResult[] {
  const activeSchemes = schemes.filter((s) => s.isActive);

  if (!profile) {
    return activeSchemes.map((scheme) => ({
      scheme,
      relevanceScore: 50,
      isLikelyEligible: true,
      rules: [
        {
          id: 'scope',
          status: 'verify_on_portal',
          labelEn: scheme.states.includes('ALL')
            ? 'Geography: Available across India'
            : `Geography: ${scheme.states.join(', ')}`,
          labelHi: scheme.states.includes('ALL')
            ? 'क्षेत्र: पूरे भारत में लागू'
            : `क्षेत्र: ${scheme.states.join(', ')}`,
          labelMr: scheme.states.includes('ALL')
            ? 'क्षेत्र: संपूर्ण भारतात लागू'
            : `क्षेत्र: ${scheme.states.join(', ')}`,
        },
        {
          id: 'land-rule',
          status: 'verify_on_portal',
          labelEn:
            scheme.maxLandHectares > 0
              ? `Landholding window: ${scheme.minLandHectares}–${scheme.maxLandHectares} ha`
              : `Minimum cultivable land: ≥ ${scheme.minLandHectares} ha (no upper cap)`,
          labelHi:
            scheme.maxLandHectares > 0
              ? `भूमि सीमा: ${scheme.minLandHectares}–${scheme.maxLandHectares} हेक्टेयर`
              : `न्यूनतम कृषि भूमि: ≥ ${scheme.minLandHectares} हेक्टेयर (अधिकतम सीमा नहीं)`,
          labelMr:
            scheme.maxLandHectares > 0
              ? `जमीन मर्यादा: ${scheme.minLandHectares}–${scheme.maxLandHectares} हेक्टर`
              : `किमान लागवडीयोग्य जमीन: ≥ ${scheme.minLandHectares} हेक्टर (कमाल मर्यादा नाही)`,
        },
      ],
    }));
  }

  const normalizedState = profile.state.trim().toLowerCase();
  const matches: SchemeMatchResult[] = [];

  for (const scheme of activeSchemes) {
    const rules: RuleCheck[] = [];
    let excluded = false;
    let score = 0;

    // 1. State / Geography check
    const isAllIndia = scheme.states.some((s) => s.toUpperCase() === 'ALL');
    const stateMatch =
      isAllIndia ||
      normalizedState === 'all india' ||
      normalizedState === '' ||
      scheme.states.some((s) => s.toLowerCase() === normalizedState);

    if (!stateMatch) {
      excluded = true;
    } else {
      score += isAllIndia ? 20 : 35;
      rules.push({
        id: 'state',
        status: 'matched',
        labelEn: isAllIndia
          ? `State rule passed: Pan-India scheme (${profile.state})`
          : `State rule passed: Verified for ${scheme.states.join(', ')}`,
        labelHi: isAllIndia
          ? `राज्य नियम लागू: अखिल भारतीय योजना (${profile.state})`
          : `राज्य नियम लागू: ${scheme.states.join(', ')} के लिए सत्यापित`,
        labelMr: isAllIndia
          ? `राज्य नियम जुळला: अखिल भारतीय योजना (${profile.state})`
          : `राज्य नियम जुळला: ${scheme.states.join(', ')} राज्यासाठी पडताळणीकृत`,
      });
    }

    // 2. Landholding check (normalized to hectares)
    if (profile.landAreaHectares !== null) {
      const ha = profile.landAreaHectares;
      const acres = profile.landAreaAcres ?? Number((ha * 2.47105).toFixed(2));
      const meetsMin = ha >= scheme.minLandHectares;
      const meetsMax = scheme.maxLandHectares === 0 || ha <= scheme.maxLandHectares;

      if (!meetsMin || !meetsMax) {
        excluded = true;
      } else {
        score += 25;
        const capEn =
          scheme.maxLandHectares > 0 ? `≤ ${scheme.maxLandHectares} ha limit` : 'no upper cap';
        const capHi =
          scheme.maxLandHectares > 0 ? `≤ ${scheme.maxLandHectares} हेक्टेयर सीमा` : 'अधिकतम सीमा नहीं';
        const capMr =
          scheme.maxLandHectares > 0 ? `≤ ${scheme.maxLandHectares} हेक्टर मर्यादा` : 'कमाल मर्यादा नाही';

        rules.push({
          id: 'land',
          status: 'matched',
          labelEn: `Landholding passed: ${acres} ac (${ha} ha) fits ${capEn}`,
          labelHi: `भूमि नियम लागू: ${acres} एकड़ (${ha} हेक्टेयर) · ${capHi}`,
          labelMr: `जमीन नियम जुळला: ${acres} एकर (${ha} हेक्टर) · ${capMr}`,
        });
      }
    } else {
      rules.push({
        id: 'land-verify',
        status: 'verify_on_portal',
        labelEn:
          scheme.maxLandHectares > 0
            ? `Verify land record on portal (${scheme.minLandHectares}–${scheme.maxLandHectares} ha)`
            : `Verify 7/12 cultivable land record (≥ ${scheme.minLandHectares} ha)`,
        labelHi:
          scheme.maxLandHectares > 0
            ? `पोर्टल पर भूमि रिकॉर्ड जांचें (${scheme.minLandHectares}–${scheme.maxLandHectares} हेक्टेयर)`
            : `7/12 कृषि भूमि रिकॉर्ड सत्यापित करें (≥ ${scheme.minLandHectares} हेक्टेयर)`,
        labelMr:
          scheme.maxLandHectares > 0
            ? `पोर्टलवर जमीन उतारा तपासा (${scheme.minLandHectares}–${scheme.maxLandHectares} हेक्टर)`
            : `७/१२ लागवडीयोग्य जमीन तपासा (≥ ${scheme.minLandHectares} हेक्टर)`,
      });
    }

    // 3. Income cap check
    if (scheme.maxIncomeINR > 0 && profile.annualIncomeINR !== null) {
      if (profile.annualIncomeINR > scheme.maxIncomeINR) {
        excluded = true;
      } else {
        score += 15;
        rules.push({
          id: 'income',
          status: 'matched',
          labelEn: `Income rule passed: ${formatINR(profile.annualIncomeINR)} ≤ ${formatINR(scheme.maxIncomeINR)}`,
          labelHi: `आय नियम लागू: ${formatINR(profile.annualIncomeINR)} ≤ ${formatINR(scheme.maxIncomeINR)}`,
          labelMr: `उत्पन्न नियम जुळला: ${formatINR(profile.annualIncomeINR)} ≤ ${formatINR(scheme.maxIncomeINR)}`,
        });
      }
    } else if (profile.annualIncomeINR !== null) {
      score += 5;
      rules.push({
        id: 'income-nocap',
        status: 'matched',
        labelEn: `Income noted (${formatINR(profile.annualIncomeINR)}/yr) · No statutory income ceiling (non-taxpayer check applies)`,
        labelHi: `आय दर्ज (${formatINR(profile.annualIncomeINR)}/वर्ष) · कोई निश्चित आय सीमा नहीं (गैर-आयकरदाता नियम लागू)`,
        labelMr: `उत्पन्न नोंद (${formatINR(profile.annualIncomeINR)}/वर्ष) · ठराविक उत्पन्न मर्यादा नाही (अ-आयकरदाता अट लागू)`,
      });
    }

    // 4. Gender eligibility & female priority slab
    let priorityNote: SchemeMatchResult['priorityNote'];
    if (scheme.genderEligibility === 'female_only' && profile.gender !== 'female') {
      excluded = true;
    } else if (
      (scheme.genderEligibility === 'female_priority' || scheme.genderEligibility === 'female_only') &&
      profile.gender === 'female'
    ) {
      score += 30;
      rules.push({
        id: 'gender-priority',
        status: 'priority',
        labelEn: 'Female Farmer Priority Slab: Higher subsidy rate / dedicated quota likely applies',
        labelHi: 'महिला किसान प्राथमिकता स्लैब: उच्च सब्सिडी दर / विशेष कोटा संभावित रूप से लागू',
        labelMr: 'महिला शेतकरी प्राधान्य गट: वाढीव अनुदान दर / विशेष कोटा संभाव्यतः लागू',
      });
      priorityNote = {
        en: 'Female Farmer Higher Subsidy Priority',
        hi: 'महिला किसान उच्च सब्सिडी प्राथमिकता',
        mr: 'महिला शेतकरी वाढीव अनुदान प्राधान्य',
      };
    }

    // 5. Need / Category alignment
    const matchedNeeds = scheme.categories.filter((c) => profile.needs.includes(c));
    if (matchedNeeds.length > 0) {
      score += 45 * matchedNeeds.length;
      rules.push({
        id: 'need',
        status: 'matched',
        labelEn: `Directly matches stated need (${matchedNeeds.map((n) => n.replace('_', ' ')).join(', ')})`,
        labelHi: `आपकी बताई गई आवश्यकता से सीधा मेल (${matchedNeeds.map((n) => n.replace('_', ' ')).join(', ')})`,
        labelMr: `तुमच्या सांगितलेल्या गरजेशी थेट सुसंगत (${matchedNeeds.map((n) => n.replace('_', ' ')).join(', ')})`,
      });
    } else if (profile.needs.length > 0) {
      // Still keep high-utility foundational schemes (like PM-KISAN / Namo Shetkari) if state/land matches,
      // but rank directly requested schemes much higher
      score += 5;
    }

    // Small/marginal farmer bonus rule highlight for micro-irrigation & equipment
    if (
      (profile.farmerCategory === 'marginal' || profile.farmerCategory === 'small') &&
      (scheme.categories.includes('irrigation') || scheme.categories.includes('equipment_subsidy'))
    ) {
      score += 15;
      rules.push({
        id: 'small-marginal',
        status: 'priority',
        labelEn: 'Small / Marginal Farmer category (≤ 2 ha) qualifies for higher subsidy slab',
        labelHi: 'लघु / सीमांत किसान श्रेणी (≤ 2 हेक्टेयर) उच्च अनुदान स्लैब के लिए संभावित पात्र',
        labelMr: 'अल्प / अत्यल्प भूधारक वर्गवारी (≤ २ हेक्टर) वाढीव अनुदान टप्प्यासाठी संभाव्य पात्र',
      });
    }

    if (!excluded) {
      matches.push({
        scheme,
        relevanceScore: score,
        rules,
        isLikelyEligible: true,
        priorityNote,
      });
    }
  }

  return matches.sort((a, b) => b.relevanceScore - a.relevanceScore);
}
