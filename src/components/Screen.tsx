import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavigationBar } from '../design/components';

/* One screen: its navigation bar, and a content column inset from the edges.

   Every screen is either the root of a tab, which gets a large title, or one
   level in, which gets an inline title and a back button. Nothing else in
   the app decides that, so the two shapes stay consistent. */

interface Props {
  title: string;
  large?: boolean;
  /** Where the back button goes. Omit for a tab root. */
  backTo?: string;
  /** For a back step that is state rather than a route. Wins over backTo. */
  onBack?: () => void;
  backLabel?: string;
  trailing?: ReactNode;
  children: ReactNode;
}

export function Screen({ title, large = false, backTo, onBack, backLabel, trailing, children }: Props) {
  const navigate = useNavigate();
  return (
    <>
      <NavigationBar
        title={title}
        large={large}
        backLabel={backLabel}
        trailing={trailing}
        onBack={onBack ?? (backTo ? () => navigate(backTo) : undefined)}
      />
      <div style={{
        width: '100%', maxWidth: 'var(--content-width)', margin: '0 auto',
        padding: 'var(--space-4) var(--screen-inset) var(--space-9)',
      }}>
        {children}
      </div>
    </>
  );
}

