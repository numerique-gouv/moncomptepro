describe('The signup Page', () => {
  it('successfully loads', async () => {
    cy.visit('http://localhost:4000/users/sign-up');
  });
});
