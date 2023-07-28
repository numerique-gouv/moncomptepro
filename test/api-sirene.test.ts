import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import nock from 'nock';
import diffusible from './api-sirene-data/diffusible.json';
import partiallyNonDiffusible from './api-sirene-data/partially-non-diffusible.json';
import { getOrganizationInfo } from '../src/connectors/api-sirene';
import { InseeNotFoundError } from '../src/errors';

chai.use(chaiAsPromised);
const assert = chai.assert;

describe('getOrganizationInfo', () => {
  beforeEach(() => {
    nock('https://api.insee.fr').post('/token').reply(200, {
      access_token: '08e42802-9ac9-3403-a2a9-b5be11ce446c',
      scope: 'am_application_scope default',
      token_type: 'Bearer',
      expires_in: 521596,
    });
  });

  it('should return valid payload for diffusible établissement', async () => {
    nock('https://api.insee.fr')
      .get('/entreprises/sirene/V3/siret/20007184300060')
      .reply(200, diffusible);
    await assert.eventually.deepEqual(getOrganizationInfo('20007184300060'), {
      siret: '20007184300060',
      libelle: 'Cc du vexin normand',
      nomComplet: 'Cc du vexin normand',
      enseigne: '',
      trancheEffectifs: null,
      trancheEffectifsUniteLegale: '22',
      libelleTrancheEffectif: null,
      etatAdministratif: 'A',
      estActive: true,
      statutDiffusion: 'O',
      estDiffusible: true,
      adresse: '3 rue maison de vatimesnil, 27150 Etrepagny',
      codePostal: '27150',
      codeOfficielGeographique: '27226',
      activitePrincipale: '84.11Z',
      libelleActivitePrincipale: '84.11Z - Administration publique générale',
      categorieJuridique: '7346',
      libelleCategorieJuridique: 'Communauté de communes',
    });
  });

  it('should show partial data for partially non diffusible établissement', async () => {
    nock('https://api.insee.fr')
      .get('/entreprises/sirene/V3/siret/94957325700019')
      .reply(200, partiallyNonDiffusible);

    await assert.eventually.deepEqual(getOrganizationInfo('94957325700019'), {
      siret: '94957325700019',
      libelle: 'Nom inconnu',
      nomComplet: 'Nom inconnu',
      enseigne: '',
      trancheEffectifs: null,
      trancheEffectifsUniteLegale: null,
      libelleTrancheEffectif: null,
      etatAdministratif: 'A',
      estActive: true,
      statutDiffusion: 'P',
      estDiffusible: false,
      adresse: '06220 Vallauris',
      codePostal: '06220',
      codeOfficielGeographique: '06155',
      activitePrincipale: '62.02A',
      libelleActivitePrincipale:
        '62.02A - Conseil en systèmes et logiciels informatiques',
      categorieJuridique: '1000',
      libelleCategorieJuridique: 'Entrepreneur individuel',
    });
  });

  it('should throw for totally non diffusible établissement', async () => {
    nock('https://api.insee.fr')
      .get('/entreprises/sirene/V3/siret/53512638700013')
      .reply(403, {
        header: {
          statut: 403,
          message: 'Établissement non diffusable (53512638700013)',
        },
      });
    await assert.isRejected(
      getOrganizationInfo('53512638700013'),
      InseeNotFoundError
    );
  });
});
