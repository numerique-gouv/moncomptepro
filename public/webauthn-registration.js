document.addEventListener('DOMContentLoaded', async function() {
  const { browserSupportsWebAuthn, startRegistration } = SimpleWebAuthnBrowser;

  const registerElement = document.getElementById('webauthn-register');
  const beginElement = document.getElementById('webauthn-btn-begin-registration');
  const successElement = document.getElementById('webauthn-success');
  const successAlertElement = document.getElementById('webauthn-alert-success');
  const errorElement = document.getElementById('webauthn-error');
  const errorAlertElement = document.getElementById('webauthn-alert-error');

  const clearDisplay = () => {
    registerElement.style.display = 'block';
    successElement.style.display = 'none';
    successAlertElement.style.display = 'none';
    successAlertElement.innerText = '';
    errorElement.style.display = 'none';
    errorAlertElement.style.display = 'none';
    errorAlertElement.innerText = '';
  };
// Start registration when the user clicks a button
  const onRegisterClick = async () => {
    // Reset success/error messages
    clearDisplay();

    // GET registration options from the endpoint that calls
    // @simplewebauthn/server -> generateRegistrationOptions()
    const resp = await fetch('/api/webauthn/generate-registration-options');

    let attResp;
    try {
      // Pass the options to the authenticator and wait for a response
      attResp = await startRegistration(await resp.json());
    } catch (error) {
      clearDisplay();
      errorAlertElement.style.display = 'block';
      if (error.name === 'InvalidStateError') {
        errorElement.innerText = `Une erreur est survenue. Erreur: cette clé est déjà enregistrée.`;
      }
      errorElement.innerText = `Une erreur est survenue. Erreur: ${JSON.stringify(error, null, 2)}`;

      throw error;
    }

    // POST the response to the endpoint that calls
    // @simplewebauthn/server -> verifyRegistrationResponse()
    const verificationResp = await fetch('/api/webauthn/verify-registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(attResp),
    });

    // Wait for the results of verification
    const verificationJSON = await verificationResp.json();

    if (verificationJSON && verificationJSON.verified) {
      clearDisplay();
      successElement.style.display = 'block';
      successAlertElement.style.display = 'block';
      successAlertElement.innerText = 'Clé d’accès créée.';
    } else {
      clearDisplay();
      errorAlertElement.style.display = 'block';
      errorElement.innerText = `Une erreur est survenue. Erreur: ${JSON.stringify(error, null, 2)}`;
    }
  };

  clearDisplay();
  if (!browserSupportsWebAuthn()) {
    errorElement.style.display = 'block';
  } else {
    registerElement.style.display = 'block';
    beginElement.addEventListener('click', onRegisterClick);
  }
}, false);
