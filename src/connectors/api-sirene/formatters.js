import { capitalize, isEmpty } from 'lodash';
import { categoriesJuridiques } from './categories-juridiques';
import { codesEffectifs } from './codes-effectifs';
import { codesNaf } from './codes-naf';
import { codesVoies } from './codes-voie';

export const formatEnseigne = (...args) =>
  capitalize(args.filter(e => !isEmpty(e)).join(' ')) || '';

export const formatNomComplet = ({
  denominationUniteLegale,
  prenomUsuelUniteLegale,
  nomUniteLegale,
  nomUsageUniteLegale,
  sigleUniteLegale,
}) => {
  const formattedFirstName = formatFirstNames([prenomUsuelUniteLegale]);
  const formattedName = formatNameFull(nomUniteLegale, nomUsageUniteLegale);
  return `${capitalize(denominationUniteLegale) ||
    [formattedFirstName, formattedName].filter(e => !!e).join(' ') ||
    'Nom inconnu'}${sigleUniteLegale ? ` (${sigleUniteLegale})` : ''}`;
};

export const formatNameFull = (nomPatronymique = '', nomUsage = '') => {
  if (nomUsage && nomPatronymique) {
    return `${capitalize(nomUsage)} (${capitalize(nomPatronymique)})`;
  }
  return capitalize(nomUsage || nomPatronymique || '');
};

export const formatFirstNames = (firstNames, nameCount = 0) => {
  const formatted = firstNames.map(capitalize).filter(name => !!name);
  if (nameCount > 0 && nameCount < firstNames.length) {
    return formatted.slice(0, nameCount).join(', ');
  }
  return formatted.join(', ');
};

const wrapWord = (word, punct = ' ', caps = false) => {
  if (!word) {
    return '';
  }
  if (caps) {
    return capitalize(word) + punct;
  }
  return word.toString().toLowerCase() + punct;
};

const libelleFromTypeVoie = codeVoie => {
  return codesVoies[codeVoie] || codeVoie;
};

export const formatAdresseEtablissement = ({
  complementAdresseEtablissement,
  numeroVoieEtablissement,
  indiceRepetitionEtablissement,
  typeVoieEtablissement,
  libelleVoieEtablissement,
  distributionSpecialeEtablissement,
  codePostalEtablissement,
  libelleCommuneEtablissement,
  codeCedexEtablissement,
  libelleCedexEtablissement,
  libelleCommuneEtrangerEtablissement,
  codePaysEtrangerEtablissement,
  libellePaysEtrangerEtablissement,
}) => {
  if (
    !complementAdresseEtablissement &&
    !numeroVoieEtablissement &&
    !typeVoieEtablissement &&
    !libelleCommuneEtablissement &&
    !distributionSpecialeEtablissement &&
    !codePostalEtablissement &&
    !codeCedexEtablissement &&
    !libelleVoieEtablissement &&
    !libelleCommuneEtrangerEtablissement &&
    !codePaysEtrangerEtablissement &&
    !libellePaysEtrangerEtablissement
  ) {
    return '';
  }

  const fullLibelleFromTypeVoie = libelleFromTypeVoie(typeVoieEtablissement);

  return [
    wrapWord(complementAdresseEtablissement, ', ', true),
    wrapWord(numeroVoieEtablissement),
    wrapWord(indiceRepetitionEtablissement),
    wrapWord(fullLibelleFromTypeVoie),
    wrapWord(libelleVoieEtablissement, ', '),
    wrapWord(distributionSpecialeEtablissement, ', '),
    wrapWord(codePostalEtablissement || codeCedexEtablissement),
    wrapWord(
      libelleCommuneEtablissement ||
        libelleCedexEtablissement ||
        libelleCommuneEtrangerEtablissement,
      '',
      true
    ),
    libellePaysEtrangerEtablissement
      ? `, ${wrapWord(libellePaysEtrangerEtablissement, '', true)}`
      : '',
  ].join('');
};

export const libelleFromCodeNaf = (codeNaf = '', addCode = true) => {
  const label = codesNaf[codeNaf] || 'Activité inconnue';
  return addCode && codeNaf ? `${codeNaf} - ${label}` : label;
};

export const libelleFromCategoriesJuridiques = categorie =>
  categoriesJuridiques[categorie] || null;

export const libelleFromCodeEffectif = (
  codeEffectif,
  anneeEffectif,
  characterEmployeurUniteLegale
) => {
  const libelle = codesEffectifs[codeEffectif];

  if (libelle && anneeEffectif) {
    return `${libelle}, en ${anneeEffectif}`;
  }
  if (libelle) {
    return libelle;
  }
  if (characterEmployeurUniteLegale === 'N') {
    return 'Unité non employeuse';
  }
  return null;
};
