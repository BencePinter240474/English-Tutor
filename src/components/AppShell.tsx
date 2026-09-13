import { NavLink, Outlet } from 'react-router-dom';

/* The elho masthead is the one fixed element: 64px tall, Graphite, logo at
   36px, 32px from the left edge, identical on every screen. Internal
   documents carry no footer, and neither does this app. */

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/flashcards', label: 'Flashcards' },
  { to: '/matching', label: 'Matching pairs' },
  { to: '/grammar', label: 'Grammar' },
  { to: '/reading', label: 'Reading' },
  { to: '/packs', label: 'Your packs' },
];

function Wordmark() {
  // The elho mark is a licensed brand asset and is not redistributed here,
  // so the masthead carries the name as type, always lowercase.
  return (
    <span style={{
      font: 'var(--weight-medium) var(--size-h5)/1 var(--font-core)',
      letterSpacing: 'var(--tracking-lg)', color: 'var(--white)',
    }}>elho</span>
  );
}

export function AppShell() {
  return (
    <>
      <header style={{
        height: 'var(--header-height)', background: 'var(--surface-header)',
        display: 'flex', alignItems: 'center', gap: 'var(--space-6)',
        padding: '0 var(--header-pad-x)', flexWrap: 'nowrap', overflowX: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)', flex: 'none' }}>
          <Wordmark />
          <span style={{ font: 'var(--type-caption)', color: 'var(--pebble)', whiteSpace: 'nowrap' }}>
            English practice
          </span>
        </div>
        <nav style={{ display: 'flex', gap: 'var(--space-1)', flex: 1 }}>
          {NAV.map(item => (
            <NavLink
              key={item.to} to={item.to} end={item.end}
              style={({ isActive }) => ({
                font: 'var(--weight-medium) var(--size-small)/1 var(--font-core)',
                color: 'var(--white)', textDecoration: 'none',
                padding: '8px 12px', whiteSpace: 'nowrap',
                borderBottom: 'var(--border-width-rule) solid ' + (isActive ? 'var(--leaf)' : 'transparent'),
                opacity: isActive ? 1 : 0.75, transition: 'var(--transition-ui)',
              })}
            >{item.label}</NavLink>
          ))}
        </nav>
      </header>
      <main
        data-doc-column
        style={{
          maxWidth: 'var(--doc-width)', margin: '0 auto',
          padding: 'var(--space-7) var(--space-5) var(--space-9)',
        }}
      >
        <Outlet />
      </main>
    </>
  );
}
