import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { TabBar } from '../design/components';

/* The app frame: whatever screen is showing, plus the tab bar.

   Three top level destinations. An exercise is not one of them: it is pushed
   from Practise and keeps the tab bar underneath, which is how a tabbed iOS
   app behaves. */

const TABS = [
  { value: '/', label: 'Practise', icon: 'cards' },
  { value: '/library', label: 'Library', icon: 'library' },
  { value: '/progress', label: 'Progress', icon: 'chart' },
];

export function AppShell() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const active = pathname.startsWith('/library') ? '/library'
    : pathname.startsWith('/progress') ? '/progress'
    : '/';

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg-grouped)',
      paddingBottom: 'calc(var(--tab-bar-height) + env(safe-area-inset-bottom, 0px))',
    }}>
      <Outlet />
      <TabBar tabs={TABS} value={active} onChange={navigate} />
    </div>
  );
}
