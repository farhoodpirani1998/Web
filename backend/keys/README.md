# keys/

`sms-public-key.pem` in this directory is a **local-development placeholder**
— an RSA public key generated on this machine, with no relationship to the
real SMS deployment. It exists only so `WebsiteAuthGuard` can boot locally
(`nest start` reads it via `SMS_JWT_PUBLIC_KEY_PATH`); it will happily verify
signatures, but only for tokens signed by the matching dev private key
(`dev-sms-private-key.pem`, gitignored, kept locally for signing test tokens
during development).

**Before deploying to any real environment:**

1. Export the actual RS256 **public** key SMS signs its JWTs with (SMS
   operators only — never the private key).
2. Replace `keys/sms-public-key.pem` with that real public key, via your
   deployment's secret/config management (not committed to this repo).
3. Point `SMS_JWT_PUBLIC_KEY_PATH` at wherever your deployment mounts it.

If this file is ever left as the dev placeholder in a non-local environment,
`WebsiteAuthGuard` will reject every real SMS-issued token (signature
mismatch) — it fails closed, not open.
