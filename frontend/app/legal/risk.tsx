import React from "react";
import { LegalLayout } from "@/src/components/LegalLayout";

export default function Risk() {
  return (
    <LegalLayout
      title="Risk Disclosures"
      intro="Cryptocurrency services carry risks. Read these disclosures before depositing funds. JATO is operated by CarbonTide Inc, a Delaware corporation."
      sections={[
        {
          heading: "1. Not a Bank",
          body: "JATO is not a chartered bank. USDC balances are not insured by the FDIC, FGC, or any deposit insurance scheme. If JATO, USDC's issuer (Circle), or our custodians fail, you may lose funds.",
        },
        {
          heading: "2. USDC Peg Risk",
          body: "USDC is a fiat-backed stablecoin issued by Circle. While it targets a 1:1 peg with the US dollar, it has temporarily deviated in the past (e.g. March 2023). Peg deviations can affect the value of your balance.",
        },
        {
          heading: "3. Network Risk",
          body: "Funds are held on the Base network (an Ethereum Layer 2). Network outages, bridge failures, or smart contract bugs may temporarily or permanently affect availability of funds.",
        },
        {
          heading: "4. Regulatory Risk",
          body: "Brazilian regulation of cryptocurrency and stablecoins is evolving. Future rules may require JATO to suspend services, freeze accounts, or change product terms.",
        },
        {
          heading: "5. Third-Party Risk",
          body: "Transak (PIX) and Gnosis Pay (card) are independent providers. Their failure, suspension, or policy changes may affect your ability to fund or spend.",
        },
        {
          heading: "6. FX Risk",
          body: "The BRL/USD rate fluctuates. Converting BRL to USDC locks in a rate at the time of trade — subsequent BRL movements may make your USDC worth more or less in BRL terms.",
        },
      ]}
    />
  );
}
