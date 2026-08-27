# Architecture

Single Next.js MVP: mobile UI, server route handlers, domain services and PostgreSQL/Prisma. Browser is untrusted; authoritative pricing, eligibility, limits, capital, payment settlement, identity state and roles stay server-side. Financial values use integer cents. Production provider events must be signature-checked, deduplicated and reconciled.
