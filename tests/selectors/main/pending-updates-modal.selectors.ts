export class PendingUpdatesModalSelectors {
  static readonly MODAL = 'app-pending-updates-modal';
  static readonly HEADER = 'app-pending-updates-modal .header h1';
  static readonly PATCH_NOTE = 'app-pending-updates-modal .patch-note';
  static readonly VERSION = 'app-pending-updates-modal .patch-note .version';
  static readonly NOTES = 'app-pending-updates-modal .patch-note .notes';
  static readonly INSTALL_BUTTON =
    'app-pending-updates-modal button:has-text("Install and reload")';
  static readonly CANCEL_BUTTON =
    'app-pending-updates-modal button:has-text("Cancel")';
}
