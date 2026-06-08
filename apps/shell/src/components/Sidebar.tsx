import { NavLink } from "react-router-dom";
import { CATALOG } from "../catalog";
import { useSession } from "../store";

export function Sidebar() {
  const isEntitled = useSession((s) => s.isEntitled);
  return (
    <nav
      style={{
        width: 220,
        background: "var(--color-surface)",
        borderRight: "1px solid var(--color-border)",
        padding: "16px 8px",
      }}
    >
      <NavLink to="/" end style={navStyle}>
        Home
      </NavLink>
      <hr style={{ border: 0, borderTop: "1px solid var(--color-border)", margin: "12px 0" }} />
      {CATALOG.map((m) => (
        <NavLink
          key={m.id}
          to={m.path}
          style={({ isActive }) => ({
            ...navStyle({ isActive }),
            opacity: isEntitled(m.id) ? 1 : 0.45,
          })}
        >
          <span
            style={{
              display: "inline-block",
              width: 22,
              height: 22,
              lineHeight: "22px",
              textAlign: "center",
              borderRadius: 4,
              background: "#eef1f6",
              marginRight: 8,
              font: "11px system-ui",
            }}
          >
            {m.icon}
          </span>
          {m.label}
        </NavLink>
      ))}
    </nav>
  );
}

function navStyle({ isActive }: { isActive: boolean }): React.CSSProperties {
  return {
    display: "block",
    padding: "8px 12px",
    borderRadius: 6,
    color: "#0f172a",
    background: isActive ? "#eef1f6" : "transparent",
    font: "500 14px system-ui",
    textDecoration: "none",
    marginBottom: 2,
  };
}
