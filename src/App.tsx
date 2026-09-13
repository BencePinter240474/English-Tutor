import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { PacksProvider } from './lib/packs';
import { Practise } from './pages/Practise';
import { Library } from './pages/Library';
import { Progress } from './pages/Progress';
import { Flashcards } from './exercises/Flashcards';
import { Matching } from './exercises/Matching';
import { Grammar } from './exercises/Grammar';
import { Reading } from './exercises/Reading';

/* Hash routing, deliberately.

   GitHub Pages serves static files and has no rewrite rule, so a deep link
   like /flashcards would 404 on a hard refresh under history routing. The
   hash keeps every route in one document, which is what a static host can
   actually serve. */

export function App() {
  return (
    <PacksProvider>
      <HashRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Practise />} />
            <Route path="flashcards" element={<Flashcards />} />
            <Route path="matching" element={<Matching />} />
            <Route path="grammar" element={<Grammar />} />
            <Route path="reading" element={<Reading />} />
            <Route path="library" element={<Library />} />
            <Route path="progress" element={<Progress />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </PacksProvider>
  );
}
