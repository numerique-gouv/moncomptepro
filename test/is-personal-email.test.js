import assert from 'assert';
import {
  getEmailDomain,
  usesAFreeEmailProvider,
} from '../src/services/uses-a-free-email-provider';

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
    it('should return true for free email provider address', () => {
      assert.equal(usesAFreeEmailProvider(personalEmailAddress), true);
    });
  });

  const professionalEmailAddresses = [
    'user@beta.gouv.fr',
    'collectivite@paris.fr',
    'nom.prenom@notaires.fr',
  ];

  professionalEmailAddresses.forEach(professionalEmailAddress => {
    it('should return false for non free provider email address', () => {
      assert.equal(usesAFreeEmailProvider(professionalEmailAddress), false);
    });
  });
});
