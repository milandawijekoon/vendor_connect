export function AuthDivider({ label = 'or' }: { label?: string }) {
  return (
    <div
      role="separator"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        margin: '18px 0',
        color: 'var(--text-muted)',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}
    >
      <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      {label}
      <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  );
}
