
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

const DashboardLayout = () => {
  return (
    <div className="flex min-h-[calc(100vh-68px)]">
      <Sidebar />

      <main className="min-w-0 flex-1 px-5 py-8 md:px-8">
        <Outlet />
      </main>
    </div>
  )
}

export default DashboardLayout
