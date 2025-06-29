import { getSession, useSession } from 'next-auth/react'
import { SimpleLayout } from '@/components/SimpleLayout'
import AutomationDashboard from '@/components/AutomationDashboard'

export default function AdminAutomation() {
  const { data: session, status } = useSession()
  if (status === 'loading') return <p className="p-6">Loading…</p>
  if (!session) return <p className="p-6">Access denied. Please sign in.</p>

  return (
    <SimpleLayout
      title="Automations"
      intro="Check your login status with a single click."
    >
      <AutomationDashboard />
    </SimpleLayout>
  )
}

export async function getServerSideProps(ctx) {
  const session = await getSession(ctx)
  if (!session || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return { redirect: { destination: '/', permanent: false } }
  }
  return { props: {} }
}