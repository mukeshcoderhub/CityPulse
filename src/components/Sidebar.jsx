
import { NavLink } from 'react-router-dom'

const links = [
  { name: 'Dashboard', path: '/', icon: '▦' },
  { name: 'Explore Issues', path: '/explore', icon: '⌕' },
  { name: 'Report Issue', path: '/report', icon: '+' },
  { name: 'City Map', path: '/map', icon: '⌖' },
  { name: 'My Reports', path: '/my-reports', icon: '▤' },
  { name: 'Profile', path: '/profile', icon: '○' },
]

const Sidebar = () => {
  return (
    <aside className="w-64 shrink-0 border-r border-[#e5e5e0] bg-white p-4">
      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-[#8a8f89]">
        Workspace
      </p>

      <nav className="space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                isActive
                  ? 'bg-[#202522] font-medium text-white'
                  : 'text-[#626762] hover:bg-[#f1f1ed] hover:text-[#202522]'
              }`
            }
          >
            <span className="w-5 text-center text-lg">
              {link.icon}
            </span>
            {link.name}
          </NavLink>
        ))}
      </nav>

      <div className="mt-8 border-t border-[#e5e5e0] pt-5">
        <p className="px-3 text-xs leading-5 text-[#8a8f89]">
          Making our cities better, one report at a time.
        </p>
      </div>
    </aside>
  )
}

export default Sidebar
