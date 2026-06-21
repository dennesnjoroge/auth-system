import { NavLink } from "react-router-dom";

function Aside() {
  const navItems = [
    { name: "Overview", path: "/dashboard" },
    { name: "Profile", path: "/dashboard/profile" },
    { name: "Settings", path: "/dashboard/settings" },
  ];

  return (
    <>
      <aside className="w-60 bg-white border-r border-gray-200 p-6 flex flex-col justify-between">
        <div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                end
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `w-full block px-3 py-2.5  text-sm ${
                    isActive
                      ? "bg-gray-100 text-black font-semibold border-l-5"
                      : "text-gray-600 hover:bg-gray-50"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="px-2"></div>
      </aside>
    </>
  );
}

export default Aside;
