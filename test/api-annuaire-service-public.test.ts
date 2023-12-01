import nock from 'nock';
import oneMairieData from './api-annuaire-service-public-data/one-mairie.json';
import invalidCogData from './api-annuaire-service-public-data/invalid-cog.json';
import twoMairiesData from './api-annuaire-service-public-data/two-mairies.json';
import { assert } from 'chai';
import { getAnnuaireServicePublicContactEmail } from '../src/connectors/api-annuaire-service-public';
import { ApiAnnuaireNotFoundError } from '../src/config/errors';

describe('getAnnuaireServicePublicContactEmail', () => {
  it('should throw an error for invalid cog', async () => {
    nock('https://etablissements-publics.api.gouv.fr')
      .get('/v3/communes/00000/mairie')
      .reply(200, invalidCogData);
    await assert.isRejected(
      getAnnuaireServicePublicContactEmail('00000', '00000'),
      ApiAnnuaireNotFoundError
    );
  });
  it('should return a valid email', async () => {
    nock('https://etablissements-publics.api.gouv.fr')
      .get('/v3/communes/74056/mairie')
      .reply(200, oneMairieData);
    await assert.eventually.equal(
      getAnnuaireServicePublicContactEmail('74056', '74400'),
      'sg@chamonix.fr'
    );
  });
  it('should return valid email for two mairies with the same Code Officiel Geographique', async () => {
    nock('https://etablissements-publics.api.gouv.fr')
      .get('/v3/communes/38253/mairie')
      .reply(200, twoMairiesData);
    await assert.eventually.equal(
      getAnnuaireServicePublicContactEmail('38253', '38860'),
      'accueil@mairie2alpes.fr'
    );
  });
});
