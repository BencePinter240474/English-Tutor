import { Icon } from './Icon';

/* The tab bar: the app's top level destinations, always reachable, never
   more than five. It is a material like the navigation bar, pinned to the
   bottom edge, and it respects the home indicator inset on an iPhone. */

export interface TabItem {
  value: string;
  label: string;
  icon: string;
}

export interface TabBarProps {
  tabs: TabItem[];
  value: string;
  onChange: (value: string) => void;
}

export function TabBar({ tabs, value, onChange }: TabBarProps) {
  return (
    <nav style={{
      position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 20,
      display: 'flex', justifyContent: 'center',
      background: 'var(--material-bar)',
      backdropFilter: 'saturate(180%) blur(20px)',
      WebkitBackdropFilter: 'saturate(180%) blur(20px)',
      borderTop: 'var(--hairline) solid var(--separator)',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }}>
      <div style={{ display: 'flex', width: '100%', maxWidth: 'var(--content-width)' }}>
        {tabs.map(tab => {
          const active = tab.value === value;
          return (
            <button
              key={tab.value} type="button"
              onClick={() => onChange(tab.value)}
              aria-current={active ? 'page' : undefined}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 3,
                minHeight: 'var(--tab-bar-height)', padding: '6px 0',
                background: 'none', border: 'none', cursor: 'pointer',
                color: active ? 'var(--tint)' : 'var(--label-secondary)',
                transition: 'color var(--duration-instant) var(--ease-standard)',
              }}
            >
              <Icon name={tab.icon} size={24} weight={active ? 2.3 : 1.9} />
              <span style={{
                font: 'var(--text-caption-2)', fontWeight: active ? 600 : 500,
                letterSpacing: 'var(--tracking-caption-2)',
              }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
