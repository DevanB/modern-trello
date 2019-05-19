declare var __DEV__: boolean;

export interface OptionsInterface {
  baseUrl: String;
  key: String;
  token?: String;
}
export type TypeType = 'redirect' | 'popup';

export type ScopeType = 'read' | 'write' | 'account';

export interface AuthorizeOptionsInterface {
  expiration: String;
  interactive: boolean;
  scope: ScopeType[];
  type: TypeType;
}

export interface AuthorizeUserOptionsInterface
  extends AuthorizeOptionsInterface {
  name?: string;
}
