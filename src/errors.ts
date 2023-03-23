export class InvalidEmailError extends Error {
  constructor(public didYouMean: string) {
    super();
    this.didYouMean = didYouMean;
  }
}

export class InvalidSiretError extends Error {}

export class InseeTimeoutError extends Error {}

export class InseeNotFoundError extends Error {}

export class InseeNotActiveError extends Error {}

export class UserNotFoundError extends Error {}

export class NotFoundError extends Error {}

export class UnableToAutoJoinOrganizationError extends Error {
  constructor(public libelle: string) {
    super();
    this.libelle = libelle;
  }
}

export class UserInOrganizationAlreadyError extends Error {}

export class InvalidCredentialsError extends Error {}

export class EmailUnavailableError extends Error {}

export class WeakPasswordError extends Error {}

export class EmailVerifiedAlreadyError extends Error {}

export class InvalidTokenError extends Error {}

export class InvalidMagicLinkError extends Error {}

export class ApiAnnuaireNotFoundError extends Error {}

export class ApiAnnuaireTooManyResultsError extends Error {}

export class ApiAnnuaireInvalidEmailError extends Error {}

export class ApiAnnuaireTimeoutError extends Error {}
