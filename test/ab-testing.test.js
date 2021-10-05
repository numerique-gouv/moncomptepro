import assert from 'assert';
import { abTestOnEmail } from '../src/managers/mail';

describe('The AB testing strategy', () => {
  it('choses an option based on provided email', () => {
    const optionA = Symbol('Option A');
    const optionB = Symbol('Option B');

    const optionAEmail = 'croute@yolo.com';

    const candidateToA = abTestOnEmail(optionA, optionB, 10, optionAEmail);

    assert.equal(candidateToA, optionA);

    const optionBEmail = 'croute4@yolo.com';

    const candidateToB = abTestOnEmail(optionA, optionB, 10, optionBEmail);

    assert.equal(candidateToB, optionB);
  });
});
