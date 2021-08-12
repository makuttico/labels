import * as fs from 'fs';
interface Label {
  name: string;
  values: any;
}
const getLanguageJsonFiles = async (language: string): Promise<any> => {
  return fetch(language + '.json').then((response) => response.json());
};
const getTranslatios = async (languages: string[]): Promise<any> => {
  new Promise<any>((resolve) => {
    const translations = Object.fromEntries(languages.map((language) => [language, '']));
    languages.forEach(async (language: string) => {
      await getLanguageJsonFiles(language).then((labels: any) => {
        translations[language] = labels;
      });
    });
    resolve(translations);
  });
};
const generateOrEditLanguagesJsonFiles = (translations: any, languages: string[]): void => {
  languages.forEach((language: string) => {
    fs.writeFile(language + '.json', JSON.stringify(translations[language]), (err) => {
      if (err) throw err;
    });
  });
};
const insertOrEditLabels = async (labels: Label[], languages: string[]): Promise<void> => {
  new Promise<any>(async (resolve) => {
    const translations = await getTranslatios(languages);
    labels.forEach(({ name: label, values }) => {
      languages.forEach((lang) => {
        translations[lang][label] = values[lang];
      });
    });
    resolve(translations);
  }).then((translations) => {
    generateOrEditLanguagesJsonFiles(translations, languages);
  });
};
const getAllLabels = async (language: string, languages: string[]): Promise<any> => {
  return await getTranslatios(languages).then((translations) => translations[language]);
};
const getLabel = async (name: string, language: string, languages: string[]): Promise<string> => {
  return await getTranslatios(languages).then((translations) => translations[language][name] as string);
};
const deleteLabel = async (name: string, languages: string[]): Promise<void> => {
  new Promise<any>(async (resolve) => {
    const translations = await getTranslatios(languages);
    languages.forEach((language) => {
      delete translations[language][name];
    });
    resolve(translations);
  }).then((translations) => {
    generateOrEditLanguagesJsonFiles(translations, languages);
  });
};
const Labels = (useLanguage: string, languages: string[]) => {
  return {
    insertOrEdit: async (labels: Label[]): Promise<void> =>
      await insertOrEditLabels(labels, languages),
    getAll: async (): Promise<any> => await getAllLabels(useLanguage, languages),
    get: async (name: string): Promise<string> => await getLabel(name, useLanguage, languages),
    delete: async (name: string): Promise<void> => await deleteLabel(name, languages),
  };
};
export default Labels;
