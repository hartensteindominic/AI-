# Deployment

For a Vercel preview, connect the GitHub repository and set Root Directory to `teni-lending`. Keep `LENDING_MODE=sandbox`. Production additionally requires managed PostgreSQL, established authentication, production identity/bank/payment/disbursement providers, signed webhook secrets, monitoring, backups and legal/compliance authorization. Never commit `.env` values; use Vercel environment variables.
