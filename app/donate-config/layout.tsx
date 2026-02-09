import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Donate Configs | Vify',
  description: 'Contribute VPN and proxy configurations to help the community bypass internet restrictions and access content freely.',
}

export default function DonateConfigLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
