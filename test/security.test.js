import assert from 'assert';

import { isEmailValid } from '../src/services/security';

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

  it('should return false if local part is longer than 64 bytes', () => {
    assert.equal(
      isEmailValid(
        '12345678901234567890123456789012345678901234567890123456789012345@test'
      ),
      false
    );
  });

  it('should return false if domain is longer than 255 bytes', () => {
    assert.equal(
      isEmailValid(
        'test@1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456'
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
    '"()[]:,;@\\"!#$%&\'*+-/=?^_`{}| ~.a"@example.org',
    '" "@example.org', // space between the quotes
    'üñîçøðé@example.com', // Unicode characters in local part
    'üñîçøðé@üñîçøðé.com', // Unicode characters in domain part
    'Pelé@example.com', // Latin
    'δοκιμή@παράδειγμα.δοκιμή', // Greek
    '我買@屋企.香港', // Chinese
    '甲斐@黒川.日本', // Japanese
    'чебурашка@ящик-с-апельсинами.рф', // Cyrillic
  ];

  validEmailAddresses.forEach(validEmailAddress => {
    it('should return true for valid email address', () => {
      assert.equal(isEmailValid(validEmailAddress), true);
    });
  });
});
