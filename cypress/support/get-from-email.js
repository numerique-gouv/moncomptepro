export const getVerificationCodeFromEmail = (email) => {
  const matches =
    /.*<span style="color: #000091; font-size: 18px;"><strong>(\s*(?:\d\s*){10})<\/strong><\/span>.*/.exec(
      email.body,
    );
  if (matches && matches.length > 0) {
    return matches[1];
  }
  throw new Error("Could not find verification code in received email");
};

export const getVerificationWordsFromEmail = (email) => {
  const matches =
    /.*<span style="color: #000091; font-size: 18px;">([a-z]{2,25}-[a-z]{2,25})<\/span>.*/.exec(
      email.body,
    );
  if (matches && matches.length > 0) {
    return matches[1];
  }
  throw new Error("Could not find verification code in received email");
};

export const getMagicLinkFromEmail = (email) => {
  const matches = /.*<a href="([^"]+)" class="r13-r default-button".*/.exec(
    email.body,
  );
  if (matches && matches.length > 0) {
    return matches[1];
  }
  throw new Error("Could not find connection link in received email");
};
