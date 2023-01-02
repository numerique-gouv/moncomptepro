export class InvalidEmailError extends Error {
  constructor(public didYouMean: string) {
    super();
    this.didYouMean = didYouMean;
  }
}

export class OrganizationNotFoundError extends Error {}

export class InvalidSiretError extends Error {}

export class UserNotFoundError extends Error {}

export class UnableToAutoJoinOrganizationError extends Error {}

export class UserInOrganizationAlreadyError extends Error {}

export class InvalidCredentialsError extends Error {}

export class EmailUnavailableError extends Error {}

export class WeakPasswordError extends Error {}

export class EmailVerifiedAlreadyError extends Error {}

export class InvalidTokenError extends Error {}

export class InvalidMagicLinkError extends Error {}
