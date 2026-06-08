type Props = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

export function PageHeader({ title, subtitle, actions }: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 24,
      }}
    >
      <div>
        <h1 style={{ margin: 0, font: "600 24px/1.2 system-ui", color: "#0f172a" }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ margin: "4px 0 0", color: "#64748b", font: "14px system-ui" }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div style={{ display: "flex", gap: 8 }}>{actions}</div>}
    </div>
  );
}
