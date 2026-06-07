import React from "react";
import { LegalLayout } from "@/src/components/LegalLayout";

export default function Privacy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      intro="CarbonTide Inc (operating JATO) respects your privacy. This policy explains what data we collect, how we use it, and your rights."
      sections={[
        {
          heading: "1. Data We Collect",
          body: "Account: name, email, CPF/CNPJ, account type. Transactional: amounts, dates, recipients, network addresses. Device: IP, app version, anonymous analytics. We do not collect bank passwords.",
        },
        {
          heading: "2. How We Use Data",
          body: "To operate the service, comply with KYC/AML laws, prevent fraud, send transactional notifications, and improve product quality. We do not sell your personal data.",
        },
        {
          heading: "3. Third Parties",
          body: "We share data with Transak (PIX processing), Gnosis Pay (card services), Cloudflare (security), and any regulator that lawfully requests it. Each has its own privacy policy.",
        },
        {
          heading: "4. Your Rights",
          body: "Under LGPD (Brazil) and GDPR-equivalent frameworks, you may request access, correction, portability, or deletion of your data. Contact [email protected].",
        },
        {
          heading: "5. Retention",
          body: "We retain KYC and transaction data for 5 years after account closure, as required by Brazilian financial regulations.",
        },
        {
          heading: "6. Security",
          body: "Passwords are stored using bcrypt hashing. Tokens are stored in encrypted device storage. Network traffic is TLS-encrypted end-to-end.",
        },
      ]}
    />
  );
}
