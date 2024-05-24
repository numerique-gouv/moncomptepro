import { startAuthentication } from "@simplewebauthn/browser";

document.addEventListener(
  "DOMContentLoaded",
  function () {
    const beginElement = document.getElementById(
      "webauthn-btn-begin-authentication",
    );
    const authenticationResponseStringInputElement = document.querySelector(
      'input[name="webauthn_authentication_response_string"]',
    );
    const authenticationResponseForm = document.getElementById(
      "webauthn-authentication-response-form",
    );
    const errorElement = document.getElementById("webauthn-alert-error");

    // Start registration when the user clicks a button
    const onAuthenticateClick = async () => {
      // Reset success/error messages
      errorElement.style.display = "none";
      errorElement.innerText = "";
      beginElement.disabled = true;

      // GET registration options from the endpoint that calls
      // @simplewebauthn/server -> generateRegistrationOptions()
      const authOptions = await fetch(
        "/api/webauthn/generate-authentication-options",
      );

      let asseResp;
      try {
        // Pass the options to the authenticator and wait for a response
        asseResp = await startAuthentication(await authOptions.json());
      } catch (error) {
        errorElement.style.display = "block";
        if (error.name === "NotAllowedError") {
          errorElement.innerText = `Une erreur est survenue. Nous n’avons pas pu vérifier vos informations. Merci de réessayer.`;
        } else {
          errorElement.innerText = `Une erreur est survenue. Erreur: ${JSON.stringify(error, null, 2)}`;
        }

        beginElement.disabled = false;
        throw error;
      }

      // POST the response to the endpoint that calls
      // @simplewebauthn/server -> verifyRegistrationResponse()
      authenticationResponseStringInputElement.value = JSON.stringify(asseResp);
      authenticationResponseForm.requestSubmit();
    };

    beginElement.addEventListener("click", onAuthenticateClick);

    const initiatingConditionalUI = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const hasNotification = urlParams.get("notification") !== null;

      if (!hasNotification) {
        const authOptions = await fetch(
          "/api/webauthn/generate-authentication-options",
        );
        try {
          let asseResp = await startAuthentication(
            await authOptions.json(),
            true,
          );

          authenticationResponseStringInputElement.value =
            JSON.stringify(asseResp);
          authenticationResponseForm.requestSubmit();
        } catch (e) {
          // fail silently
        }
      }
    };

    initiatingConditionalUI();
  },
  false,
);
