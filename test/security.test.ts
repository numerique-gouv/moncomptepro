import assert from 'assert';

import {
  isEmailValid,
  isNameValid,
  isSiretValid,
  isUrlTrusted,
} from '../src/services/security';

describe('isEmailValid', () => {
  it('should return false for undefined value', () => {
    assert.equal(isEmailValid(undefined), false);
  });

  it('should return false for empty string', () => {
    assert.equal(isEmailValid(''), false);
  });

  it('should return false if no @ is present', () => {
    assert.equal(isEmailValid('test'), false);
  });

  it('should return false if no domain is present', () => {
    assert.equal(isEmailValid('test@'), false);
  });

  it('should return false if two @ are present', () => {
    assert.equal(isEmailValid('test@test@test'), false);
  });

  it('should return false if domains contain other than letters, numbers, hyphens (-) and periods (.)', () => {
    assert.equal(isEmailValid('test@test_test'), false);
  });

  it('should return false if local part is longer than 63 characters', () => {
    assert.equal(
      isEmailValid(
        '1234567890123456789012345678901234567890123456789012345678901234@test'
      ),
      false
    );
  });

  it('should return false if total length is longer than 254 characters', () => {
    assert.equal(
      isEmailValid(
        'test@1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890'
      ),
      false
    );
  });

  // this test cases have been taken from
  // https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript/32686261#32686261
  const validEmailAddresses = [
    'prettyandsimple@example.com',
    'very.common@example.com',
    'disposable.style.email.with+symbol@example.com',
    'other.email-with-dash@example.com',
    "#!$%&'*+-/=?^_`{}|~@example.org",
    '"()[]:,;\\"!#$%&\'*+-/=?^_`{}| ~.a"@example.org',
    '" "@example.org', // space between the quotes
    'üñîçøðé@example.com', // Unicode characters in local part
    'Pelé@example.com', // Latin
  ];

  validEmailAddresses.forEach(validEmailAddress => {
    it('should return true for valid email address', () => {
      assert.equal(isEmailValid(validEmailAddress), true);
    });
  });
});

describe('isSiretValid', () => {
  it('should return false for undefined value', () => {
    assert.equal(isSiretValid(undefined), false);
  });

  it('should return false for empty string', () => {
    assert.equal(isSiretValid(''), false);
  });

  it('should return false if it contains characters other than number', () => {
    assert.equal(isSiretValid('a2345678901234'), false);
  });

  it('should return false if it contains more that 14 numbers', () => {
    assert.equal(isSiretValid('123456789012345'), false);
  });

  it('should return false if it contains less that 14 numbers', () => {
    assert.equal(isSiretValid('1234567890123'), false);
  });

  it('should return true if it contains exactly 14 numbers', () => {
    assert.equal(isSiretValid('12345678901234'), true);
  });

  it('should return true if it contains exactly 14 numbers with spaces', () => {
    assert.equal(isSiretValid('   123 456  789\n\r01234 \n'), true);
  });
});

describe('isNameValid', () => {
  it('should return false if an email is provided', () => {
    assert.equal(isNameValid('jean@domaine.fr'), false);
  });

  it('should return true if a name is provided', () => {
    assert.equal(isNameValid('Jean'), true);
  });

  it('should return true if a nom composé is provided', () => {
    assert.equal(isNameValid('Jean-Jean'), true);
  });
});

describe('isUrlTrusted', () => {
  it('should not trust null url', () => {
    assert.equal(isUrlTrusted(null), false);
  });
  it('should not trust no string url', () => {
    assert.equal(isUrlTrusted(['api.gouv.fr']), false);
  });
  it('should not trust empty url', () => {
    assert.equal(isUrlTrusted(''), false);
  });
  it('should not trust random string url', () => {
    assert.equal(isUrlTrusted('12345'), false);
  });
  it('should not trust external domain (over http)', () => {
    assert.equal(isUrlTrusted('http://www.google.com'), false);
  });
  it('should not trust external domain (over https)', () => {
    assert.equal(isUrlTrusted('https://www.google.com'), false);
  });
  it('should not trust other .gouv.fr domains', () => {
    assert.equal(isUrlTrusted('https://rogueapi.gouv.fr/franceconnect'), false);
  });
  it('should not trust domains starting with api.gouv.fr', () => {
    assert.equal(isUrlTrusted('https://api.gouv.frrogue'), false);
  });
  it('should not trust domains starting with api.gouv.fr', () => {
    assert.equal(isUrlTrusted('https://api.gouv.frrogue/franceconnect'), false);
  });
  it('should not trust uri other than using http protocol', () => {
    assert.equal(isUrlTrusted('data://yolo_https://api.gouv.fr'), false);
  });
  it('should trust url on api.gouv.fr (over http)', () => {
    assert.equal(isUrlTrusted('http://api.gouv.fr'), true);
  });
  it('should trust url on api.gouv.fr (over https)', () => {
    assert.equal(isUrlTrusted('https://api.gouv.fr'), true);
  });
  it('should trust url on api.gouv.fr with path', () => {
    assert.equal(
      isUrlTrusted('https://api.gouv.fr/les-api/api-particulier'),
      true
    );
  });
  it('should trust url on api.gouv.fr subdomains', () => {
    assert.equal(
      isUrlTrusted('https://particulier.api.gouv.fr/dashboard'),
      true
    );
  });
  it('should trust url on api.gouv.fr subdomains', () => {
    assert.equal(
      isUrlTrusted('https://datapass-staging.api.gouv.fr/franceconnect'),
      true
    );
  });
  it('should trust url on api.gouv.fr subdomains with params', () => {
    assert.equal(
      isUrlTrusted(
        'https://signup-staging.api.gouv.fr/api-impot-particulier-sandbox?scopes=%7B%22dgfip_eligibilite_lep%22%3A%20true%2C%22dgfip_annee_n_moins_1%22%3Atrue%2C%22dgfip_acces_etat_civil%22%3Atrue%7D#donnees'
      ),
      true
    );
  });
  it('should trust absolute path on same domain', () => {
    assert.equal(isUrlTrusted('/users/join-organization'), true);
  });
});
