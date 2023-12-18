document.addEventListener('DOMContentLoaded', function() {
  const { startAuthentication } = SimpleWebAuthnBrowser;

  const beginElement = document.getElementById('webauthn-btn-begin-authentication');
  const successElement = document.getElementById('webauthn-alert-success');
  const errorElement = document.getElementById('webauthn-alert-error');

// Start registration when the user clicks a button
  const onAuthenticateClick = async () => {
    // Reset success/error messages
    successElement.style.display = 'none';
    errorElement.style.display = 'none';
    errorElement.innerText = ''

    // GET registration options from the endpoint that calls
    // @simplewebauthn/server -> generateRegistrationOptions()
    const resp = await fetch('/api/webauthn/generate-authentication-options');

    let asseResp;
    try {
      // Pass the options to the authenticator and wait for a response
      asseResp = await startAuthentication(await resp.json());
    } catch (error) {
      successElement.style.display = 'none';
      errorElement.style.display = 'block';
      errorElement.innerText = `Une erreur est survenue. Erreur: ${JSON.stringify(error, null, 2)}`;

      throw error;
    }

    // POST the response to the endpoint that calls
    // @simplewebauthn/server -> verifyRegistrationResponse()
    const verificationResp = await fetch('/api/webauthn/verify-authentication', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(asseResp),
    });

    // Wait for the results of verification
    const verificationJSON = await verificationResp.json();

    if (verificationJSON && verificationJSON.verified) {
      successElement.style.display = 'block';
      successElement.innerText = 'Connexion réussie.'
      errorElement.style.display = 'none';
    } else {
      successElement.style.display = 'none';
      errorElement.style.display = 'block';
      errorElement.innerText = `Une erreur est survenue. Erreur: ${JSON.stringify(verificationJSON, null, 2)}`;
    }
  };

  beginElement.addEventListener('click', onAuthenticateClick);
}, false);
