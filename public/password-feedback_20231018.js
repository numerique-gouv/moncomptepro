document.addEventListener("DOMContentLoaded", function() {
  var passwordInput = document.getElementById("password-input");
  var passwordInputDataEmail = document.getElementById("password-input").dataset.email

  var passphraseInputMessageElement = document.getElementById("passphrase-input-message");
  var passphraseInputMessage20CharElement = document.getElementById("passphrase-input-message-20char");
  var passwordInputMessageElement = document.getElementById("password-input-message");
  var passwordInputMessage10charElement = document.getElementById("password-input-message-10char");
  var passwordInputMessageSpecialElement = document.getElementById("password-input-message-special");
  var passwordInputMessageNumberElement = document.getElementById("password-input-message-number");
  var passwordInputMessageLowercaseElement = document.getElementById("password-input-message-lowercase");
  var passwordInputMessageUppercaseElement = document.getElementById("password-input-message-uppercase");
  var passwordInputMessage128charElement = document.getElementById("password-input-message-128char");
  var passwordInputMessage3sameElement = document.getElementById("password-input-message-3same");
  var passwordInputMessageBlacklistedWordElement = document.getElementById("password-input-message-blacklisted-word");

  function clearPasswordMessages() {
    passphraseInputMessageElement.style.display = "block";
    passphraseInputMessageElement.className = "fr-message";
    passphraseInputMessage20CharElement.style.display = "block";
    passphraseInputMessage20CharElement.className = "fr-message fr-message--info";
    passwordInputMessageElement.style.display = "block";
    passwordInputMessageElement.className = "fr-message";
    passwordInputMessage10charElement.style.display = "block";
    passwordInputMessage10charElement.className = "fr-message fr-message--info";
    passwordInputMessageSpecialElement.style.display = "block";
    passwordInputMessageSpecialElement.className = "fr-message fr-message--info";
    passwordInputMessageNumberElement.style.display = "block";
    passwordInputMessageNumberElement.className = "fr-message fr-message--info";
    passwordInputMessageLowercaseElement.style.display = "block";
    passwordInputMessageLowercaseElement.className = "fr-message fr-message--info";
    passwordInputMessageUppercaseElement.style.display = "block";
    passwordInputMessageUppercaseElement.className = "fr-message fr-message--info";
    passwordInputMessage128charElement.style.display = "none";
    passwordInputMessage128charElement.className = "fr-message fr-message--info";
    passwordInputMessage3sameElement.style.display = "none";
    passwordInputMessage3sameElement.className = "fr-message fr-message--info";
    passwordInputMessageBlacklistedWordElement.style.display = "none";
    passwordInputMessageBlacklistedWordElement.className = "fr-message fr-message--info";
    passwordInputMessageBlacklistedWordElement.innerHTML = "";
  }

  function updatePasswordMessages() {
    clearPasswordMessages();
    passwordInput.setCustomValidity("");

    var inputValue = passwordInput.value;
    var inputLength = passwordInput.value.length;
    if (inputLength < 10) {
      passwordInputMessage10charElement.className = "fr-message fr-message--error";
      passwordInput.setCustomValidity("10 caractères minimum");
    }
    if (inputLength >= 10) {
      passwordInputMessage10charElement.className = "fr-message fr-message--valid";
    }
    if (inputLength >= 20) {
      passphraseInputMessage20CharElement.className = "fr-message fr-message--valid";
      passwordInputMessageElement.style.display = "none";
      passwordInputMessage10charElement.style.display = "none";
      passwordInputMessageSpecialElement.style.display = "none";
      passwordInputMessageNumberElement.style.display = "none";
      passwordInputMessageLowercaseElement.style.display = "none";
      passwordInputMessageUppercaseElement.style.display = "none";
    }
    if (inputLength > 128) {
      passwordInputMessage128charElement.style.display = "block";
      passwordInputMessage128charElement.className = "fr-message fr-message--error";
      passwordInput.setCustomValidity("128 caractères maximum");
    }
    if (inputLength < 20) {
      if (/[^A-Za-z0-9]/.test(inputValue)) {
        passwordInputMessageSpecialElement.className = "fr-message fr-message--valid";
      } else {
        passwordInputMessageSpecialElement.className = "fr-message fr-message--error";
        passwordInput.setCustomValidity("1 caractère spécial minimum");
      }
      if (/[0-9]/.test(inputValue)) {
        passwordInputMessageNumberElement.className = "fr-message fr-message--valid";
      } else {
        passwordInputMessageNumberElement.className = "fr-message fr-message--error";
        passwordInput.setCustomValidity("1 chiffre minimum");
      }
      if (/[a-z]/.test(inputValue)) {
        passwordInputMessageLowercaseElement.className = "fr-message fr-message--valid";
      } else {
        passwordInputMessageLowercaseElement.className = "fr-message fr-message--error";
        passwordInput.setCustomValidity("1 lettre minuscule minimum");
      }
      if (/[A-Z]/.test(inputValue)) {
        passwordInputMessageUppercaseElement.className = "fr-message fr-message--valid";
      } else {
        passwordInputMessageUppercaseElement.className = "fr-message fr-message--error";
        passwordInput.setCustomValidity("1 lettre majuscule minimum");
      }
    }
    if (/(.)\1{2,}/.test(inputValue)) {
      passwordInputMessage3sameElement.style.display = "block";
      passwordInputMessage3sameElement.className = "fr-message fr-message--error";
      passwordInput.setCustomValidity("2 caractères identiques successifs maximum");
    }
    if (passwordInputDataEmail && inputValue.toLowerCase().includes(passwordInputDataEmail)) {
      passwordInputMessageBlacklistedWordElement.style.display = "block";
      passwordInputMessageBlacklistedWordElement.className = "fr-message fr-message--error";
      var errorMessage = "ne doit pas contenir votre adresse email"
      passwordInputMessageBlacklistedWordElement.innerHTML = errorMessage;
      passwordInput.setCustomValidity(errorMessage);
    }
    [
      "moncomptepro",
      "mon compte pro",
      "agentconnect",
      "agent connect",
      "cheval exact agrafe pile"
    ].forEach((blacklistedWord) => {
      if (inputValue.toLowerCase().includes(blacklistedWord)) {
        passwordInputMessageBlacklistedWordElement.style.display = "block";
        passwordInputMessageBlacklistedWordElement.className = "fr-message fr-message--error";
        var errorMessage = "ne doit pas contenir « " + blacklistedWord + " »"
        passwordInputMessageBlacklistedWordElement.innerHTML = errorMessage;
        passwordInput.setCustomValidity(errorMessage);
      }
    });
  }

  clearPasswordMessages();

  passwordInput.addEventListener("input", updatePasswordMessages, false);
}, false);
