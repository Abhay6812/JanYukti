import { BenefitCategory, Language } from '../types';

export interface TranslationPack {
  brandName: string;
  brandTagline: string;
  nav: {
    find: string;
    voice: string;
    admin: string;
    funding: string;
  };
  zeroPii: {
    badgeTitle: string;
    badgeDetail: string;
    redactedAlert: string;
    checklistNotice: string;
  };
  framing: {
    likelyEligible: string;
    verifyOnPortal: string;
    disclaimer: string;
    lastVerified: string;
    verifiedBy: string;
    officialPortal: string;
    helpline: string;
  };
  hero: {
    kicker: string;
    headline: string;
    subheadline: string;
    demoHeading: string;
    demo1Title: string;
    demo1Subtitle: string;
    demo1Prompt: string;
    demo2Title: string;
    demo2Subtitle: string;
    demo2Prompt: string;
  };
  finder: {
    inputLabel: string;
    inputPlaceholder: string;
    recordVoice: string;
    stopRecording: string;
    transcribing: string;
    analyzeButton: string;
    analyzing: string;
    clearButton: string;
    unitHint: string;
    parsedHeading: string;
    landLabel: string;
    incomeLabel: string;
    stateLabel: string;
    genderLabel: string;
    categoryLabel: string;
    needsLabel: string;
    notSpecified: string;
    resultsHeading: string;
    allSchemesHeading: string;
    matchedCountLabel: string;
    whyLikelyTitle: string;
    checklistBtn: string;
    guideBtn: string;
    visitPortalBtn: string;
    noMatchesTitle: string;
    noMatchesBody: string;
    govLevel: {
      central: string;
      state: string;
      joint: string;
    };
    genderValues: {
      female: string;
      male: string;
      other: string;
      unspecified: string;
    };
    farmerCategories: {
      marginal: string;
      small: string;
      medium: string;
      large: string;
      unspecified: string;
    };
    categories: Record<BenefitCategory, string>;
  };
  checklist: {
    title: string;
    subtitle: string;
    checkedProgress: string;
    printBtn: string;
    downloadBtn: string;
    shareBtn: string;
    copiedMsg: string;
    closeBtn: string;
    portalNote: string;
  };
  guide: {
    title: string;
    loading: string;
    timelineLabel: string;
    whereLabel: string;
    stepsHeading: string;
    fraudHeading: string;
    openPortalBtn: string;
    retryBtn: string;
    closeBtn: string;
  };
  voice: {
    kicker: string;
    headline: string;
    subheadline: string;
    startBtn: string;
    stopBtn: string;
    connecting: string;
    listening: string;
    idleStatus: string;
    quickPromptsTitle: string;
    quickPrompts: string[];
    transcriptTitle: string;
    transcriptEmpty: string;
    youLabel: string;
    assistantLabel: string;
    bridgeBtn: string;
    bridgeHint: string;
    sendTextPlaceholder: string;
    sendBtn: string;
    micError: string;
  };
  admin: {
    kicker: string;
    headline: string;
    subheadline: string;
    signInBtn: string;
    signOutBtn: string;
    signedInAs: string;
    roleVerified: string;
    roleReadOnly: string;
    seedBtn: string;
    seeding: string;
    addSchemeBtn: string;
    editSchemeTitle: string;
    newSchemeTitle: string;
    verifyTodayBtn: string;
    verifiedSuccess: string;
    activeLabel: string;
    draftLabel: string;
    editBtn: string;
    deleteBtn: string;
    saveBtn: string;
    cancelBtn: string;
    liveCountLabel: string;
    officerPanelTitle: string;
    officerUidPlaceholder: string;
    officerOrgPlaceholder: string;
    grantAccessBtn: string;
    emptyFirestoreNotice: string;
  };
  funding: {
    kicker: string;
    headline: string;
    subheadline: string;
    zeroFeeTitle: string;
    zeroFeeBody: string;
    sourcesHeading: string;
    sources: {
      title: string;
      share: string;
      percent: number;
      fundingModel: string;
      description: string;
      safeguard: string;
    }[];
    economicsHeading: string;
    economicsRows: {
      metric: string;
      figure: string;
      notes: string;
    }[];
    charterHeading: string;
    charterPoints: string[];
  };
  footer: {
    note: string;
    zeroPiiTag: string;
  };
}

export const TRANSLATIONS: Record<Language, TranslationPack> = {
  en: {
    brandName: 'JanYukti',
    brandTagline: 'Farmer Benefits Finder',
    nav: {
      find: 'Find Benefits',
      voice: 'Live Voice',
      admin: 'Admin Portal',
      funding: 'Who Pays?',
    },
    zeroPii: {
      badgeTitle: 'Zero-PII Verified',
      badgeDetail: 'Never asks for or stores Aadhaar, phone number, or bank details.',
      redactedAlert: 'Personal ID or phone digits were automatically removed before processing to protect your privacy.',
      checklistNotice: 'Keep original documents with you for official portal or CSC verification only. Never share OTPs or Aadhaar inside JanYukti.',
    },
    framing: {
      likelyEligible: 'Likely Eligible',
      verifyOnPortal: 'Official Verification Required',
      disclaimer: 'JanYukti checks published rules to estimate likely eligibility. Final approval and disbursement are decided solely by the official government department.',
      lastVerified: 'Last verified',
      verifiedBy: 'Verified by',
      officialPortal: 'Official portal',
      helpline: 'Helpline',
    },
    hero: {
      kicker: 'Trilingual Civic Agritech · English / हिंदी / मराठी',
      headline: 'Discover agricultural schemes you are likely eligible for — without sharing personal IDs.',
      subheadline: 'Speak or type in English, Hindi, or Marathi using acres, hectares, guntha, or bigha. Get transparent rule checks, printable document checklists, and verified government links.',
      demoHeading: '1-Tap Judge Demo Profiles',
      demo1Title: 'Small Maharashtra Farmer',
      demo1Subtitle: '1.5 acres (60 guntha) · ₹85,000 income · Drip irrigation & crop insurance',
      demo1Prompt: 'I am a marginal farmer from Nashik, Maharashtra with 1.5 acres (60 guntha) of rainfed land and annual income ₹85,000. I need drip irrigation subsidy, crop insurance, and income support.',
      demo2Title: 'Female Farmer · Equipment Subsidy',
      demo2Subtitle: '1.2 hectares · Pune, MH · Power tiller & farm machinery grant',
      demo2Prompt: 'I am a female farmer from Pune district, Maharashtra owning 1.2 hectares of farmland with annual household income ₹1,20,000. I am looking for power tiller and agricultural equipment subsidy.',
    },
    finder: {
      inputLabel: 'Describe your farm, state, land size, and support needed',
      inputPlaceholder: 'Example: "I have 60 guntha land in Satara, Maharashtra, annual income 90,000, looking for solar pump and drip irrigation..."',
      recordVoice: 'Speak',
      stopRecording: 'Stop Mic',
      transcribing: 'Transcribing audio...',
      analyzeButton: 'Check Likely Benefits',
      analyzing: 'Checking rules...',
      clearButton: 'Reset',
      unitHint: 'Understands acres, hectares, guntha (40 guntha = 1 acre), and bigha automatically.',
      parsedHeading: 'Parsed Zero-PII Farm Profile',
      landLabel: 'Normalized Landholding',
      incomeLabel: 'Annual Income',
      stateLabel: 'State',
      genderLabel: 'Applicant',
      categoryLabel: 'Land Class',
      needsLabel: 'Identified Needs',
      notSpecified: 'Not specified',
      resultsHeading: 'Likely Eligible Schemes',
      allSchemesHeading: 'Verified Agricultural Schemes Catalog',
      matchedCountLabel: 'schemes matched',
      whyLikelyTitle: 'Transparent eligibility rules checked',
      checklistBtn: 'Document Checklist',
      guideBtn: 'AI Step-by-Step Guide',
      visitPortalBtn: 'Official Portal',
      noMatchesTitle: 'No direct rule matches found',
      noMatchesBody: 'Try broadening your need or state filter, or speak with JanYukti Live Voice for district-specific KVK options.',
      govLevel: {
        central: 'Central Govt',
        state: 'State Govt',
        joint: 'Central + State',
      },
      genderValues: {
        female: 'Female Farmer',
        male: 'Male Farmer',
        other: 'Farmer',
        unspecified: 'Not specified',
      },
      farmerCategories: {
        marginal: 'Marginal (≤ 1 ha)',
        small: 'Small (1–2 ha)',
        medium: 'Medium (2–10 ha)',
        large: 'Large (> 10 ha)',
        unspecified: 'General',
      },
      categories: {
        income_support: 'Income Support',
        irrigation: 'Micro-Irrigation',
        crop_insurance: 'Crop Insurance',
        equipment_subsidy: 'Equipment Subsidy',
        solar_pump: 'Solar Pump',
        credit_loan: 'Low-Interest Credit',
        organic_farming: 'Organic Farming',
        soil_health: 'Soil Health',
      },
    },
    checklist: {
      title: 'Document Readiness Checklist',
      subtitle: 'Prepare these documents before visiting the official government portal or CSC / Maha e-Seva Kendra.',
      checkedProgress: 'ready',
      printBtn: 'Print',
      downloadBtn: 'Download',
      shareBtn: 'Share / Copy',
      copiedMsg: 'Checklist copied to clipboard',
      closeBtn: 'Close',
      portalNote: 'Submit documents only on the verified portal below:',
    },
    guide: {
      title: 'Step-by-Step Application Guide',
      loading: 'Preparing personalized Zero-PII steps in your language...',
      timelineLabel: 'Typical timeline',
      whereLabel: 'Where to apply',
      stepsHeading: 'Actionable steps',
      fraudHeading: 'Safety & fraud prevention',
      openPortalBtn: 'Go to Official Portal',
      retryBtn: 'Try Again',
      closeBtn: 'Close',
    },
    voice: {
      kicker: 'Gemini Live Conversational Audio',
      headline: 'Talk to JanYukti Sahayak in English, Hindi, or Marathi.',
      subheadline: 'Ask about farm machinery subsidies, drip irrigation, crop insurance, or PM-KISAN by voice. Live transcripts appear instantly, and one tap carries your farm profile straight into the Scheme Finder.',
      startBtn: 'Start Live Voice',
      stopBtn: 'End Call',
      connecting: 'Connecting live voice...',
      listening: 'Live voice active — speak naturally',
      idleStatus: 'Ready for voice conversation',
      quickPromptsTitle: 'Quick voice prompts',
      quickPrompts: [
        'I have 1.5 acres in Nashik, Maharashtra. Which drip irrigation and income schemes am I likely eligible for?',
        'महिला किसान के लिए पावर टिलर और कृषि यंत्र सब्सिडी की जानकारी बताइए।',
        'माझ्याकडे ६० गुंठे शेती आहे, सोलर पंप आणि पीक विमा साठी पात्रता काय आहे?',
      ],
      transcriptTitle: 'Live Conversation Transcript',
      transcriptEmpty: 'Start a live voice session or tap a quick prompt to begin speaking with JanYukti Sahayak.',
      youLabel: 'You',
      assistantLabel: 'JanYukti Sahayak',
      bridgeBtn: 'Find Schemes from This Conversation',
      bridgeHint: 'Transfers only non-personal farm details from your conversation to Find Benefits.',
      sendTextPlaceholder: 'Or type a follow-up question while connected...',
      sendBtn: 'Send',
      micError: 'Microphone access is required for live voice. Please allow microphone permission in your browser.',
    },
    admin: {
      kicker: 'B2G & Krishi Vigyan Kendra Operations',
      headline: 'Live Welfare Scheme Verification Portal',
      subheadline: 'Sign in with Google to add, edit, or re-verify agricultural schemes in real time via Firestore. Changes sync instantly to all farmers across English, Hindi, and Marathi.',
      signInBtn: 'Sign in with Google',
      signOutBtn: 'Sign Out',
      signedInAs: 'Signed in as',
      roleVerified: 'Verified KVK / B2G Admin',
      roleReadOnly: 'Signed-in viewer (write access requires KVK Admin allowlist)',
      seedBtn: 'Sync 8 Verified Schemes to Firestore',
      seeding: 'Syncing schemes...',
      addSchemeBtn: 'Add Scheme',
      editSchemeTitle: 'Edit Welfare Scheme',
      newSchemeTitle: 'Add Verified Welfare Scheme',
      verifyTodayBtn: 'Verify Today',
      verifiedSuccess: 'Scheme verification date updated to today.',
      activeLabel: 'Live',
      draftLabel: 'Paused',
      editBtn: 'Edit',
      deleteBtn: 'Delete',
      saveBtn: 'Save to Firestore',
      cancelBtn: 'Cancel',
      liveCountLabel: 'live schemes in Firestore',
      officerPanelTitle: 'Delegate KVK Officer Access (Bootstrap Admin)',
      officerUidPlaceholder: 'Officer Firebase UID',
      officerOrgPlaceholder: 'Institution (e.g., KVK Baramati)',
      grantAccessBtn: 'Grant KVK Access',
      emptyFirestoreNotice: 'Firestore currently has 0 scheme documents. Farmers are viewing the built-in verified catalog until you click "Sync 8 Verified Schemes to Firestore" to activate live cloud management.',
    },
    funding: {
      kicker: 'Radical Financial Transparency',
      headline: 'Always ₹0 for farmers. Funded by public agritech and rural institutions.',
      subheadline: 'JanYukti never charges farmers, never takes brokerage cuts on subsidies, and never sells personal data. Here is exactly who pays to keep the platform free and unbiased.',
      zeroFeeTitle: '₹0 Farmer Fee Guarantee',
      zeroFeeBody: 'Zero subscription fees, zero application commissions, zero third-party ads, and zero personal data collection — auditable by design.',
      sourcesHeading: 'Annual Operating Funding Split',
      sources: [
        {
          title: 'State Agriculture Departments (B2G SaaS)',
          share: '55% of operating budget',
          percent: 55,
          fundingModel: 'Annual district & KVK portal licensing',
          description: 'State departments and Krishi Vigyan Kendras license JanYukti’s trilingual rule engine and verification dashboard to reduce rejected subsidy applications and field desk load.',
          safeguard: 'Contracts enforce neutral "Likely Eligible" framing and direct links to official .gov.in / .nic.in portals.',
        },
        {
          title: 'CSR Agri-Impact & Livelihood Funds',
          share: '30% of operating budget',
          percent: 30,
          fundingModel: 'Section 135 philanthropic grants',
          description: 'Rural livelihood foundations and corporate CSR programs underwrite voice AI compute and regional dialect support for marginal and women farmers.',
          safeguard: 'Grant agreements strictly prohibit donor brand placement inside scheme eligibility rankings.',
        },
        {
          title: 'Verified Seed & Fertilizer Co-operatives',
          share: '15% of operating budget',
          percent: 15,
          fundingModel: 'FPO & Mandi kiosk sponsorship',
          description: 'Farmer Producer Organizations (FPOs) and state co-op federations sponsor offline-ready village kiosk deployments and print-ready document checklists.',
          safeguard: 'Zero product steering — co-op sponsors cannot alter scheme ordering or inject commercial offers.',
        },
      ],
      economicsHeading: 'Unit Economics & Sustainability',
      economicsRows: [
        { metric: 'Farmer consultation & checklist fee', figure: '₹0', notes: 'Permanently free for all Indian farmers' },
        { metric: 'Cost per voice + AI eligibility check', figure: '₹0.42', notes: 'Covered via B2G & CSR compute pool' },
        { metric: 'Target KVK / district desk license', figure: '₹1.8L / yr', notes: 'Includes unlimited farmers & live scheme editor' },
        { metric: 'PII records stored in database', figure: '0 bytes', notes: 'Zero Aadhaar, phone, or bank data collected' },
      ],
      charterHeading: 'Non-Negotiable Farmer Trust Charter',
      charterPoints: [
        'Eligibility matching is 100% deterministic against published government circulars — never pay-to-rank.',
        'Every scheme displays its exact Last Verified date and direct https:// official government portal URL.',
        'All AI transcripts and farm queries are processed in-memory and never linked to an Aadhaar or mobile number.',
      ],
    },
    footer: {
      note: 'JanYukti provides preliminary "Likely Eligible" guidance only. Always confirm final eligibility on official government portals.',
      zeroPiiTag: 'Zero-PII · ₹0 Farmer Fees · Verified Official Links',
    },
  },

  hi: {
    brandName: 'जनयुक्ति',
    brandTagline: 'किसान लाभ खोजक',
    nav: {
      find: 'योजना खोजें',
      voice: 'लाइव वॉइस',
      admin: 'KVK एडमिन',
      funding: 'खर्च कौन देता है?',
    },
    zeroPii: {
      badgeTitle: 'जीरो-PII सुरक्षित',
      badgeDetail: 'आधार, मोबाइल नंबर या बैंक विवरण कभी नहीं मांगे या सेव किए जाते।',
      redactedAlert: 'आपकी गोपनीयता के लिए निजी पहचान संख्या या फोन नंबर स्वतः हटा दिए गए हैं।',
      checklistNotice: 'मूल दस्तावेज़ केवल आधिकारिक सरकारी पोर्टल या CSC केंद्र पर ही दिखाएं। जनयुक्ति ऐप में कभी आधार या OTP न डालें।',
    },
    framing: {
      likelyEligible: 'संभावित पात्र',
      verifyOnPortal: 'आधिकारिक जांच आवश्यक',
      disclaimer: 'जनयुक्ति प्रकाशित सरकारी नियमों के आधार पर संभावित पात्रता बताता है। अंतिम स्वीकृति और भुगतान संबंधित सरकारी विभाग द्वारा ही किया जाता है।',
      lastVerified: 'अंतिम सत्यापन',
      verifiedBy: 'सत्यापनकर्ता',
      officialPortal: 'आधिकारिक पोर्टल',
      helpline: 'हेल्पलाइन',
    },
    hero: {
      kicker: 'त्रिभाषी कृषि सहायता · English / हिंदी / मराठी',
      headline: 'बिना आधार या फोन नंबर दिए जानें आप किन सरकारी कृषि योजनाओं के लिए संभावित पात्र हैं।',
      subheadline: 'हिंदी, मराठी या अंग्रेज़ी में बोलें या लिखें — एकड़, हेक्टेयर, गुंठा या बीघा में। पारदर्शी नियम जांच, प्रिंट योग्य दस्तावेज़ सूची और सीधे सरकारी लिंक पाएं।',
      demoHeading: '1-टैप जज डेमो प्रोफ़ाइल',
      demo1Title: 'लघु/सीमांत महाराष्ट्र किसान',
      demo1Subtitle: '1.5 एकड़ (60 गुंठा) · ₹85,000 आय · टपक सिंचाई और फसल बीमा',
      demo1Prompt: 'मैं महाराष्ट्र के नाशिक जिले का छोटा किसान हूँ। मेरे पास 1.5 एकड़ (60 गुंठा) असिंचित जमीन है और सालाना आय ₹85,000 है। मुझे टपक सिंचाई सब्सिडी, फसल बीमा और आय सहायता चाहिए।',
      demo2Title: 'महिला किसान · कृषि यंत्र सब्सिडी',
      demo2Subtitle: '1.2 हेक्टेयर · पुणे, महाराष्ट्र · पावर टिलर और कृषि उपकरण अनुदान',
      demo2Prompt: 'मैं महाराष्ट्र के पुणे जिले से महिला किसान हूँ। मेरे पास 1.2 हेक्टेयर खेती की जमीन है और सालाना पारिवारिक आय ₹1,20,000 है। मुझे पावर टिलर और कृषि यंत्र सब्सिडी चाहिए।',
    },
    finder: {
      inputLabel: 'अपनी खेती, राज्य, जमीन का क्षेत्रफल और ज़रूरत बताएं',
      inputPlaceholder: 'उदाहरण: "मेरे पास महाराष्ट्र के सातारा में 60 गुंठा जमीन है, सालाना आय 90,000 है, सोलर पंप और ड्रिप सिंचाई सब्सिडी चाहिए..."',
      recordVoice: 'बोलें',
      stopRecording: 'माइक रोकें',
      transcribing: 'आवाज़ लिखी जा रही है...',
      analyzeButton: 'संभावित योजनाएं देखें',
      analyzing: 'नियम जांचे जा रहे हैं...',
      clearButton: 'रीसेट',
      unitHint: 'एकड़, हेक्टेयर, गुंठा (40 गुंठा = 1 एकड़) और बीघा को स्वतः समझता है।',
      parsedHeading: 'सत्यापित जीरो-PII कृषि विवरण',
      landLabel: 'जमीन का क्षेत्रफल',
      incomeLabel: 'सालाना आय',
      stateLabel: 'राज्य',
      genderLabel: 'आवेदक',
      categoryLabel: 'किसान श्रेणी',
      needsLabel: 'प्रमुख आवश्यकताएं',
      notSpecified: 'उल्लेख नहीं',
      resultsHeading: 'संभावित पात्र योजनाएं',
      allSchemesHeading: 'सत्यापित कृषि योजना सूची',
      matchedCountLabel: 'योजनाएं मिलीं',
      whyLikelyTitle: 'पारदर्शी पात्रता नियम जांच',
      checklistBtn: 'दस्तावेज़ सूची',
      guideBtn: 'AI आवेदन गाइड',
      visitPortalBtn: 'सरकारी पोर्टल',
      noMatchesTitle: 'सीधे नियम से मेल खाती योजना नहीं मिली',
      noMatchesBody: 'कृपया राज्य या ज़रूरत थोड़ा व्यापक करें, या जनयुक्ति लाइव वॉइस से बात करें।',
      govLevel: {
        central: 'केंद्र सरकार',
        state: 'राज्य सरकार',
        joint: 'केंद्र + राज्य',
      },
      genderValues: {
        female: 'महिला किसान',
        male: 'पुरुष किसान',
        other: 'किसान',
        unspecified: 'उल्लेख नहीं',
      },
      farmerCategories: {
        marginal: 'सीमांत (≤ 1 हेक्टेयर)',
        small: 'लघु (1–2 हेक्टेयर)',
        medium: 'मध्यम (2–10 हेक्टेयर)',
        large: 'बड़े (> 10 हेक्टेयर)',
        unspecified: 'सामान्य',
      },
      categories: {
        income_support: 'आय सहायता',
        irrigation: 'सूक्ष्म सिंचाई',
        crop_insurance: 'फसल बीमा',
        equipment_subsidy: 'कृषि यंत्र सब्सिडी',
        solar_pump: 'सोलर पंप',
        credit_loan: 'कम ब्याज ऋण',
        organic_farming: 'जैविक खेती',
        soil_health: 'मृदा स्वास्थ्य',
      },
    },
    checklist: {
      title: 'दस्तावेज़ तैयारी सूची',
      subtitle: 'आधिकारिक सरकारी पोर्टल या CSC / महा ई-सेवा केंद्र जाने से पहले ये दस्तावेज़ तैयार रखें।',
      checkedProgress: 'तैयार',
      printBtn: 'प्रिंट करें',
      downloadBtn: 'डाउनलोड',
      shareBtn: 'शेयर / कॉपी',
      copiedMsg: 'दस्तावेज़ सूची कॉपी हो गई',
      closeBtn: 'बंद करें',
      portalNote: 'दस्तावेज़ केवल नीचे दिए गए आधिकारिक पोर्टल पर ही जमा करें:',
    },
    guide: {
      title: 'चरण-दर-चरण आवेदन गाइड',
      loading: 'आपकी भाषा में जीरो-PII आवेदन चरण तैयार किए जा रहे हैं...',
      timelineLabel: 'अनुमानित समय',
      whereLabel: 'आवेदन कहाँ करें',
      stepsHeading: 'आवश्यक चरण',
      fraudHeading: 'सुरक्षा और धोखाधड़ी से बचाव',
      openPortalBtn: 'आधिकारिक पोर्टल खोलें',
      retryBtn: 'पुनः प्रयास करें',
      closeBtn: 'बंद करें',
    },
    voice: {
      kicker: 'Gemini Live रियल-टाइम वॉइस सहायक',
      headline: 'जनयुक्ति सहायक से हिंदी, मराठी या अंग्रेज़ी में सीधे बात करें।',
      subheadline: 'कृषि यंत्र सब्सिडी, टपक सिंचाई, फसल बीमा या पीएम-किसान के बारे में बोलकर पूछें। लाइव ट्रांसक्रिप्ट देखें और एक टैप में योजना खोजक पर जाएं।',
      startBtn: 'लाइव वॉइस शुरू करें',
      stopBtn: 'कॉल समाप्त करें',
      connecting: 'लाइव वॉइस जुड़ रहा है...',
      listening: 'लाइव वॉइस चालू है — स्वाभाविक रूप से बोलें',
      idleStatus: 'वॉइस बातचीत के लिए तैयार',
      quickPromptsTitle: 'त्वरित वॉइस प्रश्न',
      quickPrompts: [
        'मेरे पास महाराष्ट्र के नाशिक में 1.5 एकड़ जमीन है, टपक सिंचाई और आय सहायता की कौन-सी योजनाएं मिल सकती हैं?',
        'महिला किसान के लिए पावर टिलर और कृषि यंत्र सब्सिडी की जानकारी बताइए।',
        'कुसुम सोलर पंप योजना के लिए संभावित पात्रता और ज़रूरी कागज़ात क्या हैं?',
      ],
      transcriptTitle: 'लाइव बातचीत का लिखित विवरण',
      transcriptEmpty: 'जनयुक्ति सहायक से बात करने के लिए "लाइव वॉइस शुरू करें" दबाएं या कोई त्वरित प्रश्न चुनें।',
      youLabel: 'आप',
      assistantLabel: 'जनयुक्ति सहायक',
      bridgeBtn: 'इस बातचीत से योजनाएं खोजें',
      bridgeHint: 'बातचीत से केवल गैर-व्यक्तिगत कृषि जानकारी योजना खोजक में ले जाता है।',
      sendTextPlaceholder: 'जुड़े रहते हुए अगला प्रश्न लिखें...',
      sendBtn: 'भेजें',
      micError: 'लाइव वॉइस के लिए माइक्रोफ़ोन की अनुमति आवश्यक है। कृपया ब्राउज़र में माइक चालू करें।',
    },
    admin: {
      kicker: 'B2G और कृषि विज्ञान केंद्र (KVK) पोर्टल',
      headline: 'लाइव सरकारी योजना सत्यापन डैशबोर्ड',
      subheadline: 'Firebase Firestore के माध्यम से रीयल-टाइम में योजनाएं जोड़ने, संपादित करने और सत्यापित करने के लिए Google से साइन-इन करें।',
      signInBtn: 'Google से साइन-इन करें',
      signOutBtn: 'साइन आउट',
      signedInAs: 'साइन-इन खाता',
      roleVerified: 'सत्यापित KVK / B2G एडमिन',
      roleReadOnly: 'केवल देखने की अनुमति (बदलाव हेतु KVK एडमिन स्वीकृति आवश्यक)',
      seedBtn: '8 सत्यापित योजनाएं Firestore में सिंक करें',
      seeding: 'सिंक हो रहा है...',
      addSchemeBtn: 'नई योजना जोड़ें',
      editSchemeTitle: 'योजना संपादित करें',
      newSchemeTitle: 'नई सत्यापित योजना जोड़ें',
      verifyTodayBtn: 'आज सत्यापित करें',
      verifiedSuccess: 'योजना की सत्यापन तिथि आज के लिए अपडेट हो गई।',
      activeLabel: 'सक्रिय',
      draftLabel: 'रुकी हुई',
      editBtn: 'संपादित करें',
      deleteBtn: 'हटाएं',
      saveBtn: 'Firestore में सेव करें',
      cancelBtn: 'रद्द करें',
      liveCountLabel: 'लाइव योजनाएं Firestore में',
      officerPanelTitle: 'KVK अधिकारी एक्सेस दें (बूटस्ट्रैप एडमिन)',
      officerUidPlaceholder: 'अधिकारी का Firebase UID',
      officerOrgPlaceholder: 'संस्थान (जैसे KVK बारामती)',
      grantAccessBtn: 'KVK एक्सेस दें',
      emptyFirestoreNotice: 'Firestore में अभी 0 योजनाएं हैं। लाइव क्लाउड प्रबंधन शुरू करने के लिए "8 सत्यापित योजनाएं Firestore में सिंक करें" पर क्लिक करें।',
    },
    funding: {
      kicker: 'पूर्ण वित्तीय पारदर्शिता',
      headline: 'किसानों के लिए हमेशा ₹0। राज्य कृषि विभागों और ग्रामीण संस्थानों द्वारा वित्तपोषित।',
      subheadline: 'जनयुक्ति किसानों से कभी कोई शुल्क नहीं लेता, सब्सिडी पर कोई कमीशन नहीं लेता और कभी निजी डेटा नहीं बेचता। जानिए यह मंच कैसे मुफ़्त चलता है।',
      zeroFeeTitle: '₹0 किसान शुल्क की गारंटी',
      zeroFeeBody: 'कोई सदस्यता शुल्क नहीं, कोई दलाली नहीं, कोई विज्ञापन नहीं और कोई निजी डेटा संग्रह नहीं।',
      sourcesHeading: 'वार्षिक संचालन फंडिंग विवरण',
      sources: [
        {
          title: 'राज्य कृषि विभाग (B2G लाइसेंसिंग)',
          share: 'संचालन बजट का 55%',
          percent: 55,
          fundingModel: 'वार्षिक जिला व KVK पोर्टल लाइसेंस',
          description: 'राज्य कृषि विभाग और कृषि विज्ञान केंद्र अधूरे आवेदनों की अस्वीकृति घटाने के लिए जनयुक्ति के त्रिभाषी नियम इंजन का उपयोग करते हैं।',
          safeguard: 'अनुबंध तटस्थ "संभावित पात्र" नियम और केवल आधिकारिक .gov.in / .nic.in लिंक सुनिश्चित करते हैं।',
        },
        {
          title: 'CSR कृषि-प्रभाव और ग्रामीण आजीविका फंड',
          share: 'संचालन बजट का 30%',
          percent: 30,
          fundingModel: 'सेक्शन 135 परोपकारी अनुदान',
          description: 'ग्रामीण विकास फाउंडेशन और CSR फंड सीमांत व महिला किसानों के लिए वॉइस AI और क्षेत्रीय भाषा सहायता का खर्च उठाते हैं।',
          safeguard: 'अनुदान समझौते योजना रैंकिंग में किसी भी निजी प्रचार को पूरी तरह प्रतिबंधित करते हैं।',
        },
        {
          title: 'सत्यापित बीज एवं उर्वरक सहकारी समितियां',
          share: 'संचालन बजट का 15%',
          percent: 15,
          fundingModel: 'FPO और मंडी कियोस्क प्रायोजन',
          description: 'किसान उत्पादक संगठन (FPO) और राज्य सहकारी संघ ग्राम स्तर पर कियोस्क और प्रिंट दस्तावेज़ सूची का समर्थन करते हैं।',
          safeguard: 'कोई उत्पाद प्रचार नहीं — सहकारी प्रायोजक योजनाओं के क्रम में कोई बदलाव नहीं कर सकते।',
        },
      ],
      economicsHeading: 'इकाई अर्थशास्त्र और स्थिरता',
      economicsRows: [
        { metric: 'किसान परामर्श व दस्तावेज़ सूची शुल्क', figure: '₹0', notes: 'सभी भारतीय किसानों के लिए सदा मुफ़्त' },
        { metric: 'प्रति वॉइस + AI पात्रता जांच लागत', figure: '₹0.42', notes: 'B2G और CSR फंड द्वारा वहन' },
        { metric: 'लक्ष्य KVK / जिला डेस्क लाइसेंस', figure: '₹1.8 लाख / वर्ष', notes: 'असीमित किसान और लाइव योजना संपादक' },
        { metric: 'डेटाबेस में संग्रहीत PII डेटा', figure: '0 बाइट', notes: 'आधार, फोन या बैंक विवरण कभी नहीं' },
      ],
      charterHeading: 'अपरिवर्तनीय किसान विश्वास घोषणापत्र',
      charterPoints: [
        'पात्रता मिलान 100% प्रकाशित सरकारी परिपत्रों पर आधारित है — कभी पेड रैंकिंग नहीं।',
        'हर योजना पर अंतिम सत्यापन तिथि और सीधा https:// आधिकारिक सरकारी पोर्टल लिंक दिखता है।',
        'सभी वॉइस ट्रांसक्रिप्ट और प्रश्न बिना आधार या मोबाइल नंबर से जोड़े संसाधित होते हैं।',
      ],
    },
    footer: {
      note: 'जनयुक्ति केवल प्रारंभिक "संभावित पात्र" मार्गदर्शन देता है। अंतिम पात्रता की पुष्टि हमेशा आधिकारिक सरकारी पोर्टल पर करें।',
      zeroPiiTag: 'जीरो-PII · ₹0 किसान शुल्क · सत्यापित सरकारी लिंक',
    },
  },

  mr: {
    brandName: 'जनयुक्ती',
    brandTagline: 'शेतकरी योजना शोधक',
    nav: {
      find: 'योजना शोधा',
      voice: 'लाईव्ह व्हॉइस',
      admin: 'KVK प्रशासन',
      funding: 'निधी कोण देते?',
    },
    zeroPii: {
      badgeTitle: 'झिरो-PII सुरक्षित',
      badgeDetail: 'आधार, मोबाईल नंबर किंवा बँक तपशील कधीही मागितले किंवा साठवले जात नाहीत.',
      redactedAlert: 'तुमच्या गोपनीयतेसाठी वैयक्तिक ओळख क्रमांक किंवा फोन नंबर आपोआप काढून टाकले आहेत.',
      checklistNotice: 'मूळ कागदपत्रे केवळ अधिकृत शासकीय पोर्टल किंवा महा ई-सेवा / CSC केंद्रावरच दाखवा. जनयुक्ती ॲपमध्ये आधार किंवा OTP कधीही टाकू नका.',
    },
    framing: {
      likelyEligible: 'संभाव्य पात्र',
      verifyOnPortal: 'अधिकृत पडताळणी आवश्यक',
      disclaimer: 'जनयुक्ती प्रसिद्ध शासकीय नियमांवर आधारित संभाव्य पात्रता दाखवते. अंतिम मंजुरी आणि अनुदान वितरण केवळ संबंधित शासकीय विभागामार्फतच केले जाते.',
      lastVerified: 'शेवटची पडताळणी',
      verifiedBy: 'पडताळणीकर्ता',
      officialPortal: 'अधिकृत पोर्टल',
      helpline: 'हेल्पलाईन',
    },
    hero: {
      kicker: 'त्रिभाषिक कृषी सहाय्य · English / हिंदी / मराठी',
      headline: 'आधार किंवा फोन नंबर न देता तुम्ही कोणत्या कृषी योजनांसाठी संभाव्य पात्र आहात ते जाणून घ्या.',
      subheadline: 'मराठी, हिंदी किंवा इंग्रजीमध्ये बोला किंवा लिहा — एकर, हेक्टर, गुंठा किंवा बिघा मोजमापात. पारदर्शक नियम तपासणी, कागदपत्र यादी आणि थेट अधिकृत शासकीय लिंक मिळवा.',
      demoHeading: '1-टॅप जज डेमो प्रोफाईल',
      demo1Title: 'अल्पभूधारक महाराष्ट्र शेतकरी',
      demo1Subtitle: '१.५ एकर (६० गुंठे) · ₹८५,००० उत्पन्न · ठिबक सिंचन व पीक विमा',
      demo1Prompt: 'मी नाशिक जिल्ह्यातील अल्पभूधारक शेतकरी आहे. माझ्याकडे १.५ एकर (६० गुंठे) कोरडवाहू शेती आहे आणि वार्षिक उत्पन्न ₹८५,००० आहे. मला ठिबक सिंचन अनुदान, पीक विमा आणि उत्पन्न सहाय्य हवे आहे.',
      demo2Title: 'महिला शेतकरी · कृषी यंत्र अनुदान',
      demo2Subtitle: '१.२ हेक्टर · पुणे, महाराष्ट्र · पॉवर टिलर व कृषी अवजारे अनुदान',
      demo2Prompt: 'मी पुणे जिल्ह्यातील महिला शेतकरी आहे. माझ्याकडे १.२ हेक्टर शेती आहे आणि वार्षिक कौटुंबिक उत्पन्न ₹१,२०,००० आहे. मला पॉवर टिलर आणि कृषी यंत्र अनुदानाची माहिती हवी आहे.',
    },
    finder: {
      inputLabel: 'तुमची शेती, राज्य, जमिनीचे क्षेत्रफळ आणि गरज सांगा',
      inputPlaceholder: 'उदाहरण: "माझ्याकडे सातारा जिल्ह्यात ६० गुंठे शेती आहे, वार्षिक उत्पन्न ९०,००० आहे, मला सोलर पंप आणि ठिबक सिंचन अनुदान हवे आहे..."',
      recordVoice: 'बोला',
      stopRecording: 'माईक थांबवा',
      transcribing: 'आवाज लिहिला जात आहे...',
      analyzeButton: 'संभाव्य योजना तपासा',
      analyzing: 'नियम तपासत आहे...',
      clearButton: 'रीसेट',
      unitHint: 'एकर, हेक्टर, गुंठा (४० गुंठे = १ एकर) आणि बिघा आपोआप समजते.',
      parsedHeading: 'झिरो-PII शेती प्रोफाईल सारांश',
      landLabel: 'जमिनीचे क्षेत्रफळ',
      incomeLabel: 'वार्षिक उत्पन्न',
      stateLabel: 'राज्य',
      genderLabel: 'अर्जदार',
      categoryLabel: 'शेतकरी वर्गवारी',
      needsLabel: 'ओळखलेल्या गरजा',
      notSpecified: 'नमूद नाही',
      resultsHeading: 'संभाव्य पात्र योजना',
      allSchemesHeading: 'पडताळणीकृत कृषी योजना यादी',
      matchedCountLabel: 'योजना जुळल्या',
      whyLikelyTitle: 'पारदर्शक पात्रता नियम तपासणी',
      checklistBtn: 'कागदपत्र यादी',
      guideBtn: 'AI अर्ज मार्गदर्शक',
      visitPortalBtn: 'अधिकृत पोर्टल',
      noMatchesTitle: 'थेट नियमांशी जुळणारी योजना सापडली नाही',
      noMatchesBody: 'कृपया गरज किंवा राज्य तपशील थोडा व्यापक करा, किंवा जनयुक्ती लाईव्ह व्हॉइसशी संवाद साधा.',
      govLevel: {
        central: 'केंद्र शासन',
        state: 'राज्य शासन',
        joint: 'केंद्र + राज्य',
      },
      genderValues: {
        female: 'महिला शेतकरी',
        male: 'पुरुष शेतकरी',
        other: 'शेतकरी',
        unspecified: 'नमूद नाही',
      },
      farmerCategories: {
        marginal: 'अत्यल्प भूधारक (≤ १ हेक्टर)',
        small: 'अल्पभूधारक (१–२ हेक्टर)',
        medium: 'मध्यम (२–१० हेक्टर)',
        large: 'मोठे (> १० हेक्टर)',
        unspecified: 'सर्वसाधारण',
      },
      categories: {
        income_support: 'उत्पन्न सहाय्य',
        irrigation: 'सूक्ष्म सिंचन',
        crop_insurance: 'पीक विमा',
        equipment_subsidy: 'कृषी यंत्र अनुदान',
        solar_pump: 'सोलर पंप',
        credit_loan: 'कमी व्याज पीक कर्ज',
        organic_farming: 'सेंद्रिय शेती',
        soil_health: 'मृदा आरोग्य',
      },
    },
    checklist: {
      title: 'कागदपत्र तयारी यादी',
      subtitle: 'अधिकृत शासकीय पोर्टल किंवा महा ई-सेवा / CSC केंद्रावर जाण्यापूर्वी ही कागदपत्रे तयार ठेवा.',
      checkedProgress: 'तयार',
      printBtn: 'प्रिंट करा',
      downloadBtn: 'डाऊनलोड',
      shareBtn: 'शेअर / कॉपी',
      copiedMsg: 'कागदपत्र यादी कॉपी झाली',
      closeBtn: 'बंद करा',
      portalNote: 'कागदपत्रे केवळ खालील अधिकृत शासकीय पोर्टलवरच सादर करा:',
    },
    guide: {
      title: 'टप्प्याटप्प्याने अर्ज मार्गदर्शक',
      loading: 'तुमच्या भाषेत झिरो-PII अर्ज टप्पे तयार करत आहोत...',
      timelineLabel: 'अंदाजित कालावधी',
      whereLabel: 'अर्ज कुठे करावा',
      stepsHeading: 'महत्त्वाचे टप्पे',
      fraudHeading: 'सुरक्षा आणि फसवणूक टाळण्यासाठी टीप',
      openPortalBtn: 'अधिकृत पोर्टल उघडा',
      retryBtn: 'पुन्हा प्रयत्न करा',
      closeBtn: 'बंद करा',
    },
    voice: {
      kicker: 'Gemini Live थेट संवादात्मक आवाज सहाय्यक',
      headline: 'जनयुक्ती सहाय्यकाशी मराठी, हिंदी किंवा इंग्रजीमध्ये थेट बोला.',
      subheadline: 'कृषी अवजारे अनुदान, ठिबक सिंचन, पीक विमा किंवा नमो शेतकरी योजनेबद्दल बोलून विचारा. थेट लिखित संवाद पहा आणि एका टॅपमध्ये योजना शोधकाकडे जा.',
      startBtn: 'लाईव्ह व्हॉइस सुरू करा',
      stopBtn: 'संवाद थांबवा',
      connecting: 'लाईव्ह व्हॉइस जोडत आहे...',
      listening: 'लाईव्ह व्हॉइस सुरू आहे — सहज बोला',
      idleStatus: 'आवाज संवादासाठी तयार',
      quickPromptsTitle: 'झटपट आवाज प्रश्न',
      quickPrompts: [
        'माझ्याकडे नाशिकमध्ये ६० गुंठे शेती आहे, ठिबक सिंचन आणि उत्पन्न सहाय्यासाठी कोणत्या योजना मिळू शकतात?',
        'महिला शेतकऱ्यांसाठी पॉवर टिलर आणि कृषी यंत्र अनुदान किती टक्के मिळते?',
        'कुसुम सोलर पंप योजनेसाठी संभाव्य पात्रता आणि कागदपत्रे काय लागतात?',
      ],
      transcriptTitle: 'थेट संवाद मजकूर',
      transcriptEmpty: 'जनयुक्ती सहाय्यकाशी बोलण्यासाठी "लाईव्ह व्हॉइस सुरू करा" दाबा किंवा झटपट प्रश्न निवडा.',
      youLabel: 'तुम्ही',
      assistantLabel: 'जनयुक्ती सहाय्यक',
      bridgeBtn: 'या संवादातून योजना शोधा',
      bridgeHint: 'संवादातील केवळ वैयक्तिक नसलेले शेतीचे तपशील योजना शोधकाकडे नेते.',
      sendTextPlaceholder: 'जोडलेले असताना पुढचा प्रश्न लिहा...',
      sendBtn: 'पाठवा',
      micError: 'लाईव्ह व्हॉइससाठी मायक्रोफोनची परवानगी आवश्यक आहे. कृपया ब्राउझरमध्ये माईक सुरू करा.',
    },
    admin: {
      kicker: 'B2G आणि कृषी विज्ञान केंद्र (KVK) प्रशासन',
      headline: 'थेट शासकीय योजना पडताळणी पोर्टल',
      subheadline: 'Firebase Firestore मध्ये थेट कृषी योजना जोडण्यासाठी, संपादित करण्यासाठी आणि पडताळणी करण्यासाठी Google ने साईन-इन करा.',
      signInBtn: 'Google ने साईन-इन करा',
      signOutBtn: 'साईन आऊट',
      signedInAs: 'साईन-इन खाते',
      roleVerified: 'पडताळणीकृत KVK / B2G प्रशासक',
      roleReadOnly: 'फक्त पाहण्याची परवानगी (बदलासाठी KVK प्रशासक मान्यता आवश्यक)',
      seedBtn: '८ पडताळणीकृत योजना Firestore मध्ये सिंक करा',
      seeding: 'सिंक होत आहे...',
      addSchemeBtn: 'नवीन योजना जोडा',
      editSchemeTitle: 'योजना संपादित करा',
      newSchemeTitle: 'नवीन पडताळणीकृत योजना जोडा',
      verifyTodayBtn: 'आज पडताळणी करा',
      verifiedSuccess: 'योजनेची पडताळणी तारीख आजच्या तारखेला अद्यतनित झाली.',
      activeLabel: 'सक्रिय',
      draftLabel: 'थांबवलेली',
      editBtn: 'संपादन',
      deleteBtn: 'काढून टाका',
      saveBtn: 'Firestore मध्ये जतन करा',
      cancelBtn: 'रद्द करा',
      liveCountLabel: 'थेट योजना Firestore मध्ये',
      officerPanelTitle: 'KVK अधिकारी प्रवेश द्या (बूटस्ट्रॅप प्रशासक)',
      officerUidPlaceholder: 'अधिकाऱ्याचा Firebase UID',
      officerOrgPlaceholder: 'संस्था (उदा. KVK बारामती)',
      grantAccessBtn: 'KVK प्रवेश द्या',
      emptyFirestoreNotice: 'Firestore मध्ये सध्या ० योजना आहेत. थेट क्लाउड व्यवस्थापन सुरू करण्यासाठी "८ पडताळणीकृत योजना Firestore मध्ये सिंक करा" वर क्लिक करा.',
    },
    funding: {
      kicker: 'संपूर्ण आर्थिक पारदर्शकता',
      headline: 'शेतकऱ्यांसाठी नेहमी ₹0 शुल्क. राज्य कृषी विभाग आणि ग्रामीण संस्थांद्वारे निधी.',
      subheadline: 'जनयुक्ती शेतकऱ्यांकडून कोणतेही शुल्क घेत नाही, अनुदानावर कमिशन घेत नाही आणि वैयक्तिक डेटा विकत नाही. हा प्लॅटफॉर्म मोफत कसा चालतो ते पहा.',
      zeroFeeTitle: '₹0 शेतकरी शुल्काची हमी',
      zeroFeeBody: 'कोणतेही सदस्यत्व शुल्क नाही, दलाली नाही, जाहिराती नाहीत आणि कोणताही वैयक्तिक डेटा साठवला जात नाही.',
      sourcesHeading: 'वार्षिक निधी विभागणी',
      sources: [
        {
          title: 'राज्य कृषी विभाग (B2G परवाना)',
          share: 'वार्षिक खर्चाचा ५५%',
          percent: 55,
          fundingModel: 'वार्षिक जिल्हा व KVK पोर्टल परवाना',
          description: 'राज्य कृषी विभाग आणि कृषी विज्ञान केंद्रे अपूर्ण अर्ज नाकारण्याचे प्रमाण कमी करण्यासाठी जनयुक्तीचे त्रिभाषिक नियम इंजिन वापरतात.',
          safeguard: 'करारामुळे तटस्थ "संभाव्य पात्र" मांडणी आणि केवळ अधिकृत .gov.in / .nic.in लिंक बंधनकारक आहेत.',
        },
        {
          title: 'CSR कृषी-प्रभाव आणि ग्रामीण उपजीविका निधी',
          share: 'वार्षिक खर्चाचा ३०%',
          percent: 30,
          fundingModel: 'कलम १३५ सामाजिक दायित्व अनुदान',
          description: 'ग्रामीण विकास संस्था आणि CSR निधी अल्पभूधारक व महिला शेतकऱ्यांसाठी व्हॉइस AI आणि प्रादेशिक भाषा सहाय्याचा खर्च उचलतात.',
          safeguard: 'अनुदान करारांनुसार योजना क्रमवारीत कोणत्याही खाजगी ब्रँडचा प्रभाव पूर्णपणे प्रतिबंधित आहे.',
        },
        {
          title: 'पडताळणीकृत बियाणे व खत सहकारी संस्था',
          share: 'वार्षिक खर्चाचा १५%',
          percent: 15,
          fundingModel: 'FPO आणि बाजार समिती कियोस्क प्रायोजकत्व',
          description: 'शेतकरी उत्पादक कंपन्या (FPO) आणि सहकारी संघ गावपातळीवरील कियोस्क व प्रिंट कागदपत्र यादीसाठी निधी देतात.',
          safeguard: 'कोणतेही उत्पादन विक्री धोरण नाही — प्रायोजक योजनांच्या पात्रतेत हस्तक्षेप करू शकत नाहीत.',
        },
      ],
      economicsHeading: 'खर्च रचना आणि शाश्वतता',
      economicsRows: [
        { metric: 'शेतकरी सल्ला व कागदपत्र यादी शुल्क', figure: '₹0', notes: 'सर्व भारतीय शेतकऱ्यांसाठी कायमचे मोफत' },
        { metric: 'प्रति व्हॉइस + AI पात्रता तपासणी खर्च', figure: '₹0.42', notes: 'B2G आणि CSR निधीतून भरपाई' },
        { metric: 'नियोजित KVK / जिल्हा डेस्क परवाना', figure: '₹1.8 लाख / वर्ष', notes: 'अमर्यादित शेतकरी व थेट योजना संपादन' },
        { metric: 'डेटाबेसमध्ये साठवलेला PII डेटा', figure: '0 बाईट', notes: 'आधार, फोन किंवा बँक माहिती कधीच नाही' },
      ],
      charterHeading: 'अढळ शेतकरी विश्वास सनद',
      charterPoints: [
        'पात्रता तपासणी १००% प्रसिद्ध शासकीय शासन निर्णयांनुसार होते — पैसे देऊन वरचा क्रम मिळत नाही.',
        'प्रत्येक योजनेवर शेवटची पडताळणी तारीख आणि थेट https:// अधिकृत शासकीय पोर्टल लिंक असते.',
        'सर्व आवाज संवाद आणि प्रश्न आधार किंवा मोबाईल क्रमांकाशी न जोडता तात्काळ प्रक्रिया केले जातात.',
      ],
    },
    footer: {
      note: 'जनयुक्ती केवळ प्राथमिक "संभाव्य पात्र" मार्गदर्शन देते. अंतिम पात्रतेची खात्री नेहमी अधिकृत शासकीय पोर्टलवरच करा.',
      zeroPiiTag: 'झिरो-PII · ₹0 शेतकरी शुल्क · पडताळणीकृत शासकीय लिंक',
    },
  },
};
