document.addEventListener('DOMContentLoaded', async function() {
  const { browserSupportsWebAuthn, startRegistration } = SimpleWebAuthnBrowser;

  const beginElement = document.getElementById('webauthn-btn-begin-registration');
  const registrationResponseStringInputElement = document.querySelector('input[name="registration_response_string"]');
  const registrationResponseForm = document.getElementById('registration_response_form');
  const successAlertElement = document.getElementById('webauthn-alert-success');
  const notSupportedElement = document.getElementById('webauthn-not-supported');
  const errorAlertElement = document.getElementById('webauthn-alert-error');

  const clearDisplay = () => {
    successAlertElement.style.display = 'none';
    successAlertElement.innerText = '';
    notSupportedElement.style.display = 'none';
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
        errorAlertElement.innerText = `Une erreur est survenue. Erreur: cette clé est déjà enregistrée.`;
      }
      errorAlertElement.innerText = `Une erreur est survenue. Erreur: ${JSON.stringify(error, null, 2)}`;

      throw error;
    }

    // POST the response to the endpoint that calls
    // @simplewebauthn/server -> verifyRegistrationResponse()
    registrationResponseStringInputElement.value = JSON.stringify(attResp);
    registrationResponseForm.submit();
  };

  clearDisplay();

  if (!browserSupportsWebAuthn()) {
    notSupportedElement.style.display = 'block';
  } else {
    beginElement.addEventListener('click', onRegisterClick);
  }
}, false);
