import { NavLink, useLocation } from "react-router-dom";

const navItems = [
  { name: "Venues Profile", path: "/profile" },
  { name: "Manage Events", path: "/events" },
  { name: "Messages", path: "/messages" },
  { name: "Reviews", path: "/review" },
  { name: "Helpful Tools", path: "/tools" },
  { name: "Settings", path: "/settings" }
];

interface SideNavProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const SideNav = ({ isSidebarOpen, toggleSidebar }: SideNavProps) => {
  const location = useLocation();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-20 w-[300px] bg-black shadow-md transform ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 md:translate-x-0 md:relative`}
    >
      <nav className="pt-28 md:pt-12 lg:pt-20 sticky -top-16 mb-6">
        <ul className="space-y-2 pl-4 md:pl-12 lg:pl-24">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) => {
                  const pathWithoutSlash = item.path.substring(1);
                  const isPathActive = location.pathname.includes(pathWithoutSlash.replace('s', ''));
                  return `block px-4 py-2 font-['Space_Grotesk'] text-[16px] leading-[100%] align-middle ${
                    isActive || isPathActive ? "text-[#FFFFFF]" : "text-[#888888]"
                  }`;
                }}
              >
                {item.name}
              </NavLink>
            </li>
          ))}
          {isSidebarOpen && (
            <li className="mt-8">
              <NavLink
                to="#"
                className="px-4 py-2 font-['Space_Grotesk'] text-[16px] leading-[100%] align-middle text-[#888888] flex items-center gap-2"
              >
                <img
                  src="/login.svg"
                  alt="Logout"
                  className="w-[19px] h-[20px]"
                />
                <span>Logout</span>
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default SideNav;