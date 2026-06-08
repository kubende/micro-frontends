import { NavLink } from "react-router-dom";
import { useSession } from "../store";

/**
 * Module-scoped sub-navigation. Fed by the active remote's `subNav`.
 * Rendered as a second column between the primary sidebar and main content.
 * Collapses entirely when the active module declared no subNav.
 */
export function SubSidebar() {
  const active = useSession((s) => s.activeSubNav);
  if (!active || active.items.length === 0) return null;

  return (
    <nav
      style={{
        width: 200,
        background: "var(--color-surface)",
        borderRight: "1px solid var(--color-border)",
        padding: "16px 8px",
      }}
    >
      {active.items.map((item) => {
        const to = joinPath(active.basePath, item.path);
        return (
          <NavLink
            key={to}
            to={to}
            end={item.end}
            style={({ isActive }) => ({
              display: "block",
              padding: "8px 12px",
              borderRadius: 6,
              color: "#0f172a",
              background: isActive ? "#eef1f6" : "transparent",
              font: "500 14px system-ui",
              textDecoration: "none",
              marginBottom: 2,
            })}
          >
            {item.icon && (
              <span
                style={{
                  display: "inline-block",
                  width: 18,
                  marginRight: 8,
                  color: "#64748b",
                  font: "11px system-ui",
                }}
              >
                {item.icon}
              </span>
            )}
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

function joinPath(base: string, rel: string) {
  if (!rel) return base;
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const r = rel.startsWith("/") ? rel.slice(1) : rel;
  return `${b}/${r}`;
}
