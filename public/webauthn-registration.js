document.addEventListener('DOMContentLoaded', function() {
  const { startRegistration } = SimpleWebAuthnBrowser;

  const registerElement = document.getElementById('webauthn-register');
  const beginElement = document.getElementById('webauthn-btn-begin');
  const successElement = document.getElementById('webauthn-success');
  const errorElement = document.getElementById('webauthn-error');

  registerElement.style.display = 'block';
  successElement.style.display = 'none';
  errorElement.style.display = 'none';

// Start registration when the user clicks a button
  beginElement.addEventListener('click', async () => {
    // Reset success/error messages
    registerElement.style.display = 'block';
    successElement.style.display = 'none';
    errorElement.style.display = 'none';

    // GET registration options from the endpoint that calls
    // @simplewebauthn/server -> generateRegistrationOptions()
    const resp = await fetch('/api/webauthn/generate-registration-options');

    let attResp;
    try {
      // Pass the options to the authenticator and wait for a response
      attResp = await startRegistration(await resp.json());
    } catch (error) {
      registerElement.style.display = 'none';
      successElement.style.display = 'none';
      errorElement.style.display = 'block';
      if (error.name === 'InvalidStateError') {
        console.error('Error: Authenticator was probably already registered by user');
      }

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
      registerElement.style.display = 'none';
      successElement.style.display = 'block';
      errorElement.style.display = 'none';
    } else {
      registerElement.style.display = 'none';
      successElement.style.display = 'none';
      errorElement.style.display = 'block';
      console.error(`Oh no, something went wrong! Response: <pre>${JSON.stringify(
        verificationJSON,
      )}</pre>`);
    }
  });
}, false);
