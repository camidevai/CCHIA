import { useLanguage } from '../contexts/LanguageContext';

// Importar todos los archivos JSON en español
import navigationES from '../data/navigation.json';
import heroES from '../data/hero.json';
import objectivesES from '../data/objectives.json';
import benefitsES from '../data/benefits.json';
import collaboratorsES from '../data/collaborators.json';
import contactES from '../data/contact.json';
import footerES from '../data/footer.json';
import siteES from '../data/site.json';

// Importar todos los archivos JSON en inglés
import navigationEN from '../data/en/navigation.json';
import heroEN from '../data/en/hero.json';
import objectivesEN from '../data/en/objectives.json';
import benefitsEN from '../data/en/benefits.json';
import collaboratorsEN from '../data/en/collaborators.json';
import contactEN from '../data/en/contact.json';
import footerEN from '../data/en/footer.json';
import siteEN from '../data/en/site.json';

const translations = {
  es: {
    navigation: navigationES,
    hero: heroES,
    objectives: objectivesES,
    benefits: benefitsES,
    collaborators: collaboratorsES,
    contact: contactES,
    footer: footerES,
    site: siteES,
  },
  en: {
    navigation: navigationEN,
    hero: heroEN,
    objectives: objectivesEN,
    benefits: benefitsEN,
    collaborators: collaboratorsEN,
    contact: contactEN,
    footer: footerEN,
    site: siteEN,
  },
};

export const useTranslation = () => {
  const { language } = useLanguage();

  const t = (key) => {
    return translations[language][key];
  };

  return { t, language };
};

