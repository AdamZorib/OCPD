// Consent definitions for RODO/GDPR and IDD compliance

export type ConsentType = 
  | 'RODO_DATA_PROCESSING'
  | 'RODO_MARKETING'
  | 'IDD_IPID_RECEIVED'
  | 'IDD_OWU_RECEIVED'
  | 'DATA_ACCURACY'
  | 'E_DOCUMENTS';

export interface ConsentDefinition {
  type: ConsentType;
  labelPL: string;
  labelEN: string;
  descriptionPL: string;
  descriptionEN: string;
  required: boolean;
  regulation: 'RODO' | 'IDD' | 'GENERAL';
}

export const CONSENT_DEFINITIONS: ConsentDefinition[] = [
  {
    type: 'RODO_DATA_PROCESSING',
    labelPL: 'Zapoznałem się z informacją o przetwarzaniu danych osobowych',
    labelEN: 'I acknowledge the personal data processing information',
    descriptionPL: 'Wyrażam zgodę na przetwarzanie moich danych osobowych przez ubezpieczyciela w celu zawarcia i wykonania umowy ubezpieczenia zgodnie z art. 6 ust. 1 lit. b RODO.',
    descriptionEN: 'I consent to the processing of my personal data by the insurer for the purpose of concluding and performing the insurance contract in accordance with Art. 6(1)(b) GDPR.',
    required: true,
    regulation: 'RODO',
  },
  {
    type: 'DATA_ACCURACY',
    labelPL: 'Oświadczam, że podane dane są prawdziwe i kompletne',
    labelEN: 'I declare that the provided data is true and complete',
    descriptionPL: 'Potwierdzam, że wszystkie informacje podane we wniosku są zgodne ze stanem faktycznym i nie zataiłem żadnych okoliczności mogących mieć wpływ na ocenę ryzyka.',
    descriptionEN: 'I confirm that all information provided in the application is in accordance with the facts and I have not concealed any circumstances that may affect the risk assessment.',
    required: true,
    regulation: 'GENERAL',
  },
  {
    type: 'IDD_IPID_RECEIVED',
    labelPL: 'Potwierdzam otrzymanie Karty Produktu (IPID)',
    labelEN: 'I confirm receipt of the Insurance Product Information Document (IPID)',
    descriptionPL: 'Przed zawarciem umowy otrzymałem i zapoznałem się z Kartą Produktu (IPID), która zawiera kluczowe informacje o ubezpieczeniu.',
    descriptionEN: 'Before concluding the contract, I received and reviewed the Insurance Product Information Document (IPID), which contains key information about the insurance.',
    required: true,
    regulation: 'IDD',
  },
  {
    type: 'IDD_OWU_RECEIVED',
    labelPL: 'Potwierdzam otrzymanie Ogólnych Warunków Ubezpieczenia (OWU)',
    labelEN: 'I confirm receipt of General Terms and Conditions (GTC)',
    descriptionPL: 'Przed zawarciem umowy otrzymałem i zapoznałem się z Ogólnymi Warunkami Ubezpieczenia OCP.',
    descriptionEN: 'Before concluding the contract, I received and reviewed the General Terms and Conditions of OCP Insurance.',
    required: true,
    regulation: 'IDD',
  },
  {
    type: 'E_DOCUMENTS',
    labelPL: 'Wyrażam zgodę na otrzymywanie dokumentów drogą elektroniczną',
    labelEN: 'I consent to receiving documents electronically',
    descriptionPL: 'Wyrażam zgodę na przesyłanie polisy, certyfikatów i innych dokumentów ubezpieczeniowych na podany adres e-mail.',
    descriptionEN: 'I consent to the sending of the policy, certificates and other insurance documents to the provided email address.',
    required: false,
    regulation: 'GENERAL',
  },
  {
    type: 'RODO_MARKETING',
    labelPL: 'Wyrażam zgodę na komunikację marketingową',
    labelEN: 'I consent to marketing communications',
    descriptionPL: 'Wyrażam zgodę na otrzymywanie informacji handlowych i marketingowych drogą elektroniczną. Zgoda jest dobrowolna i może być w każdej chwili wycofana.',
    descriptionEN: 'I consent to receiving commercial and marketing information electronically. Consent is voluntary and can be withdrawn at any time.',
    required: false,
    regulation: 'RODO',
  },
];

export interface ConsentState {
  [key: string]: boolean;
}

export const getInitialConsentState = (): ConsentState => {
  const state: ConsentState = {};
  CONSENT_DEFINITIONS.forEach((consent) => {
    state[consent.type] = false;
  });
  return state;
};

export const getRequiredConsents = (): ConsentDefinition[] => {
  return CONSENT_DEFINITIONS.filter((c) => c.required);
};

export const getOptionalConsents = (): ConsentDefinition[] => {
  return CONSENT_DEFINITIONS.filter((c) => !c.required);
};

export const validateRequiredConsents = (consents: ConsentState): { valid: boolean; missing: ConsentType[] } => {
  const requiredConsents = getRequiredConsents();
  const missing: ConsentType[] = [];

  requiredConsents.forEach((consent) => {
    if (!consents[consent.type]) {
      missing.push(consent.type);
    }
  });

  return {
    valid: missing.length === 0,
    missing,
  };
};

export const getConsentByType = (type: ConsentType): ConsentDefinition | undefined => {
  return CONSENT_DEFINITIONS.find((c) => c.type === type);
};
