import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { createDynamicContainer } from 'react-sweet-state';

import { useColor } from './components/color';
import { useWidth } from './components/width';

const ThemingContainer = createDynamicContainer({
  matcher: (Store) => Store.tags?.includes('theme') ?? false,
});

const colors = ['white', 'aliceblue', 'beige', 'gainsboro', 'honeydew'];
const widths = [200, 220, 240, 260, 280];
const rand = () => Math.floor(Math.random() * colors.length);

/**
 * Components
 */
const ThemeHook = ({ title }: { title: string }) => {
  const [{ color }, { set: setColor }] = useColor();
  const [{ width }, { set: setWidth }] = useWidth();

  return (
    <div style={{ background: color, width }}>
      <h3>Component {title}</h3>
      <p>Color: {color}</p>
      <p>Width: {width}</p>
      <button onClick={() => setColor(colors[rand()])}>Change color</button>
      <button onClick={() => setWidth(widths[rand()])}>Change width</button>
    </div>
  );
};

/**
 * Main App
 */
const App = () => (
  <div>
    <h1>Advanced dynamic scoped example</h1>
    <main>
      <ThemingContainer scope="t1">
        <ThemeHook title="scope" />
      </ThemingContainer>
      <ThemingContainer>
        <ThemeHook title="local" />
      </ThemingContainer>
      <ThemingContainer scope="t1">
        <ThemeHook title="scope sync" />
      </ThemingContainer>
    </main>
  </div>
);

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
