import {
  AuthorizeOptionsInterface,
  AuthorizeUserOptionsInterface,
  OptionsInterface,
} from '../types';
import { stringify } from './stringify';

export default class TrelloClient {
  private key: String;
  private token?: String = undefined;

  private version: String = '1';
  private authEndpoint: String = 'https://trello.com';

  public constructor(options: OptionsInterface) {
    this.token = options.token;
    this.key = options.key;
  }

  private authorizeURL = (args: any) => {
    const baseArgs = {
      response_type: 'token',
      key: this.key,
    };
    const mergedOptions = Object.assign(baseArgs, args);
    return `${this.authEndpoint}/${this.version}/authorize?${stringify(
      mergedOptions
    )}`;
  };

  public authorize = (userOptions: AuthorizeUserOptionsInterface) => {
    return new Promise(resolve => {
      const defaultOptions: AuthorizeOptionsInterface = {
        type: 'redirect',
        interactive: true,
        scope: ['read'],
        expiration: '30days',
      };

      const authorizeOptions: AuthorizeUserOptionsInterface = Object.assign(
        defaultOptions,
        userOptions
      );

      const regexToken = /[&#]?token=([0-9a-f]{64})/;

      if (this.token === undefined) {
        const match = regexToken.exec(window.location.hash);
        if (match) {
          this.token = match[1];
        }
      }

      if (this.token !== undefined) {
        location.hash = location.hash.replace(regexToken, '');
        return;
      }

      if (!authorizeOptions.interactive) {
        return;
      }

      const scope = (authorizeOptions.scope || []).join(',');

      switch (authorizeOptions.type) {
        case 'popup':
          (() => {
            const width = 550;
            const height = 725;
            const left = window.screenX + (window.innerWidth - width) / 2;
            const top = window.screenY + (window.innerHeight - height) / 2;
            const originMatch = new RegExp(`^[a-z]+://[^/]*`).exec(
              window.location.href
            );
            const origin = originMatch && originMatch[0];
            const authWindow = window.open(
              this.authorizeURL({
                return_url: origin,
                callback_method: 'postMessage',
                scope,
                expiration: authorizeOptions.expiration,
                name: authorizeOptions.name,
              }),
              'trello',
              `width=${width},height=${height},left=${left},top=${top}`
            );

            const receiveMessage = (event: any) => {
              if (
                event.origin !== this.authEndpoint ||
                event.source !== authWindow
              ) {
                return;
              }

              if (event.source != null) {
                event.source.close();
              }

              if (event.data != null && /[0-9a-f]{64}/.test(event.data)) {
                this.token = event.data;
              } else {
                this.token = undefined;
              }

              if (typeof window.removeEventListener === 'function') {
                window.removeEventListener('message', receiveMessage, false);
              }

              if (this.token !== undefined) {
                resolve(this.token);
              }
            };

            // Listen for messages from the auth window
            if (typeof window.addEventListener === 'function') {
              window.addEventListener('message', receiveMessage, false);
            }
          })();
          break;
        case 'redirect':
          window.location.href = this.authorizeURL({
            redirect_uri: location.href,
            callback_method: 'fragment',
            scope,
            expiration: authorizeOptions.expiration,
            name: authorizeOptions.name,
          });
          break;
        default:
          window.location.href = this.authorizeURL({
            redirect_uri: location.href,
            callback_method: 'fragment',
            scope,
            expiration: authorizeOptions.expiration,
            name: authorizeOptions.name,
          });
      }
    });
  };
}
