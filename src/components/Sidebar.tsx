// src/components/Sidebar.tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: "/assistants", label: "Assistants", icon: "🤖" },
    { path: "/agents", label: "Agents", icon: "🤖" },
    { path: "/knowledge", label: "Knowledge", icon: "📚" },
    { path: "/files", label: "Files", icon: "📁" },
    { path: "/settings/providers", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="w-64 bg-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">DesktopChat</h1>
      </div>
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  location.pathname.startsWith(item.path)
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;