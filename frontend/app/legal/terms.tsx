import React from "react";
import { LegalLayout } from "@/src/components/LegalLayout";

export default function Terms() {
  return (
    <LegalLayout
      title="Terms of Service"
      intro="These Terms govern your use of the JATO platform. JATO is operated by CarbonTide Inc, a Delaware corporation."
      sections={[
        {
          heading: "1. Eligibility",
          body: "JATO is available to verified Brazilian residents over 18. Not available to US persons. We collect CPF (individuals) or CNPJ (businesses) to comply with applicable AML/KYC regulations.",
        },
        {
          heading: "2. Services",
          body: "We let you fund a USDC balance using PIX (processed by Transak), hold USDC on the Base network, and spend abroad with a JATO Visa debit card (issued via Gnosis Pay, where available). USDC is a regulated stablecoin and is not FDIC insured.",
        },
        {
          heading: "3. Fees",
          body: "JATO charges 0.5% on PIX top-ups. Transak charges 3.5% on PIX. Holding USDC is free. Card spend abroad has no JATO FX markup. Network fees apply to on-chain transfers.",
        },
        {
          heading: "4. Risk",
          body: "Cryptocurrency, including USDC, carries risk. The price of USDC may deviate from $1 in adverse market conditions. JATO is not a bank and does not guarantee redemption.",
        },
        {
          heading: "5. Limitation of Liability",
          body: "CarbonTide Inc is not liable for losses from third-party providers (Transak, Gnosis Pay), network outages, or user error. Maximum liability is capped at fees paid in the prior 12 months.",
        },
        {
          heading: "6. Governing Law",
          body: "These Terms are governed by the laws of the State of Delaware, USA. Disputes shall be resolved in the courts of Delaware.",
        },
      ]}
    />
  );
}
