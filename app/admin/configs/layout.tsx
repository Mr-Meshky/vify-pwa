import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin - Config Moderation | Vify',
  description: 'Review and moderate community-submitted VPN and proxy configurations',
}

export default function AdminConfigsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
