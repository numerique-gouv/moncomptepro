import {
  isCollectiviteTerritoriale,
  isEntrepriseUnipersonnelle,
  isServicePublic,
} from '../src/services/organization';
import assert from 'assert';

const association_org_info: Organization = {
  siret: '83511518900010',
  cached_tranche_effectifs: '00',
  cached_tranche_effectifs_unite_legale: '00',
  cached_libelle_tranche_effectif:
    "0 salarié (n'ayant pas d'effectif au 31/12 mais ayant employé des salariés au cours de l'année de référence), en 2020",
  cached_activite_principale: '81.21Z',
  cached_libelle_activite_principale:
    '81.21Z - Nettoyage courant des bâtiments',
  cached_categorie_juridique: '9220',
  cached_libelle_categorie_juridique: 'Association déclarée',
};

const entreprise_unipersonnelle_org_info: Organization = {
  siret: '49871959000107',
  cached_tranche_effectifs: null,
  cached_tranche_effectifs_unite_legale: '21',
  cached_libelle_tranche_effectif: null,
  cached_activite_principale: '88.10A',
  cached_libelle_activite_principale: '88.10A - Aide à domicile',
  cached_categorie_juridique: '5499',
  cached_libelle_categorie_juridique:
    'Société à responsabilité limitée (sans autre indication)',
};

describe('isEntrepriseUnipersonnelle', () => {
  it('should return false for bad call', () => {
    assert.equal(isEntrepriseUnipersonnelle({}), false);
  });

  it('should return true for unipersonnelle organization', () => {
    assert.equal(
      isEntrepriseUnipersonnelle(entreprise_unipersonnelle_org_info),
      true
    );
  });

  it('should return false for association', () => {
    assert.equal(isEntrepriseUnipersonnelle(association_org_info), false);
  });
});

const lamalou_org_info: Organization = {
  siret: '21340126800130',
  cached_tranche_effectifs: '12',
  cached_tranche_effectifs_unite_legale: '21',
  cached_libelle_tranche_effectif: '20 à 49 salariés, en 2020',
  cached_activite_principale: '84.11Z',
  cached_libelle_activite_principale:
    '84.11Z - Administration publique générale',
  cached_categorie_juridique: '7210',
  cached_libelle_categorie_juridique: 'Commune et commune nouvelle',
};

const dinum_org_info: Organization = {
  siret: '13002526500013',
  cached_tranche_effectifs: '22',
  cached_tranche_effectifs_unite_legale: '22',
  cached_libelle_tranche_effectif: '100 à 199 salariés, en 2020',
  cached_activite_principale: '84.11Z',
  cached_libelle_activite_principale:
    '84.11Z - Administration publique générale',
  cached_categorie_juridique: '7120',
  cached_libelle_categorie_juridique: "Service central d'un ministère",
};

describe('isCollectiviteTerritoriale', () => {
  it('should return false for bad call', () => {
    assert.equal(isCollectiviteTerritoriale({}), false);
  });

  it('should return true for collectivite territoriale', () => {
    assert.equal(isCollectiviteTerritoriale(lamalou_org_info), true);
  });

  it('should return false for administration centrale', () => {
    assert.equal(isCollectiviteTerritoriale(dinum_org_info), false);
  });
});

describe('isServicePublic', () => {
  it('should return false for bad call', () => {
    assert.equal(isServicePublic({}), false);
  });

  it('should return true for collectivite territoriale', () => {
    assert.equal(isServicePublic(lamalou_org_info), true);
  });

  it('should return true for administration centrale', () => {
    assert.equal(isServicePublic(dinum_org_info), true);
  });

  it('should return false for unipersonnelle organization', () => {
    assert.equal(isServicePublic(entreprise_unipersonnelle_org_info), false);
  });

  it('should return false for association', () => {
    assert.equal(isServicePublic(association_org_info), false);
  });
});
