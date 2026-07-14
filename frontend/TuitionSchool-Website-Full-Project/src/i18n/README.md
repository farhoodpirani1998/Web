# i18n

Owns UI-chrome translation and locale/direction mechanics only (Website
Frontend Architecture §28). Content text is always backend-owned and
arrives already resolved for the requested locale via the Public API —
this folder never contains CMS content.

**Phase 1 scope:** locale list, RTL detection, and locale-segment
validation only (`locale.ts`). The UI-chrome translation dictionary
(button labels, aria-labels, validation copy) is added once the first
feature that needs frontend-owned strings is implemented — introducing
it earlier would be speculative, per the "start inside the feature that
needs it, promote once a second feature needs the same thing" rule
(§6).
