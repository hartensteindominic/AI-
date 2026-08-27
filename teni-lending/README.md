# Teni Lending Sandbox

Teni is a temporary working name for a mobile-first USD small-dollar lending product. This repository is intentionally **sandbox-first**. It does not move real money and does not claim lending authorization.

## Working now

- mobile-first borrower shell
- server-side $10 maximum principal
- integer-cent money math
- one active loan policy
- $100 sandbox capital with $20 reserve
- production fail-closed configuration
- domain tests
- Vercel-ready Next.js structure

## Important

Software implementation is not legal authorization to lend. Production must stay disabled until real authentication, KYC, bank linking, payment/disbursement providers, reconciliation, state-specific legal review, disclosures, licensing/partner structure, servicing and security controls are approved.

## Run

```bash
cp .env.example .env.local
npm install
npm test
npm run dev
```
