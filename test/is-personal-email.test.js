import assert from 'assert';
import {
  getEmailDomain,
  isPersonalEmail,
} from '../src/services/is-personal-email';

describe('getEmailDomain', () => {
  it('should return email domain', () => {
    assert.equal(getEmailDomain('user@beta.gouv.fr'), 'beta.gouv.fr');
  });
});

describe('isPersonalEmail', () => {
  const personalEmailAddresses = [
    'user@gmail.com',
    'collectivite@wanadoo.fr',
    'collectivite@orange.fr',
  ];

  personalEmailAddresses.forEach(personalEmailAddress => {
    it('should return true for personal email address', () => {
      assert.equal(isPersonalEmail(personalEmailAddress), true);
    });
  });

  const professionalEmailAddresses = [
    'user@beta.gouv.fr',
    'collectivite@paris.fr',
  ];

  professionalEmailAddresses.forEach(professionalEmailAddress => {
    it('should return false for professional email address', () => {
      assert.equal(isPersonalEmail(professionalEmailAddress), false);
    });
  });
});
