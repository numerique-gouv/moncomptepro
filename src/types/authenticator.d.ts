import { CredentialDeviceType } from "@simplewebauthn/typescript-types";

interface BaseAuthenticator {
  credential_id: Uint8Array;
  credential_public_key: Uint8Array;
  counter: number;
  // Ex: 'singleDevice' | 'multiDevice'
  credential_device_type: CredentialDeviceType;
  credential_backed_up: boolean;
  // Ex: ['usb' | 'ble' | 'nfc' | 'internal']
  transports?: AuthenticatorTransport[];
}

interface Authenticator extends BaseAuthenticator {
  user_id: number;
}
