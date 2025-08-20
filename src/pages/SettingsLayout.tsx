// src/pages/SettingsLayout.tsx
import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";

const SettingsLayout: React.FC = () => {
  const location = useLocation();

  const settingsSections = [
    { path: "/settings/general", label: "General" },
    { path: "/settings/providers", label: "Providers" },
    { path: "/settings/model", label: "Model" },
    { path: "/settings/mcp", label: "MCP Servers" },
    { path: "/settings/data", label: "Data" },
    { path: "/settings/web-search", label: "Web Search" },
    { path: "/settings/about", label: "About" },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 border-r border-gray-700 bg-gray-800">
          <nav className="p-4">
            <ul className="space-y-2">
              {settingsSections.map((section) => (
                <li key={section.path}>
                  <Link
                    to={section.path}
                    className={`block p-3 rounded-lg transition-colors ${
                      location.pathname === section.path
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {section.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;