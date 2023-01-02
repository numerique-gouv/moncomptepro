import assert from 'assert';
import { getDidYouMeanSuggestion } from '../src/services/did-you-mean';

describe('getDidYouMeanSuggestion', () => {
  const emailAddresses = [
    ['agent@gmil.com', 'agent@gmail.com'],
    ['agent@wanadoo.rf', 'agent@wanadoo.fr'],
    ['agent@beta.gouv.rf', 'agent@beta.gouv.fr'],
    ['agent@beta.gouvfr', 'agent@beta.gouv.fr'],
    ['agent@beta.gov.fr', 'agent@beta.gouv.fr'],
    ['agent@betagouv.rf', 'agent@betagouv.fr'],
    ['agent@nomatch', ''],
  ];

  emailAddresses.forEach(([inputEmail, suggestedEmail]) => {
    it('should return true for personal email address', () => {
      assert.equal(getDidYouMeanSuggestion(inputEmail), suggestedEmail);
    });
  });
});
