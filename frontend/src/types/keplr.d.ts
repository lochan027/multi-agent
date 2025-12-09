/**
 * Keplr Wallet Type Definitions
 */

import { Window as KeplrWindow } from '@keplr-wallet/types';

declare global {
  interface Window extends KeplrWindow {}
}
