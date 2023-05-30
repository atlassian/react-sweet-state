import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import { useColor } from './components/color';
import { useWidth } from './components/width';
import { ThemingContainer } from './components/theming';
import { defaults } from 'react-sweet-state';

defaults.devtools = true;

const colors = ['aliceblue', 'beige', 'gainsboro', 'honeydew'];
const widths = [220, 240, 260, 280];
const rand = () => Math.floor(Math.random() * colors.length);
const initialData = { color: 'white', width: 200 };

/**
 * Components
 */
const ThemeHook = ({ title }: { title: string }) => {
  const [{ color }, { set: setColor }] = useColor();
  const [{ width }, { set: setWidth, resetAll }] = useWidth();

  return (
    <div style={{ background: color, width }}>
      <h3>Component {title}</h3>
      <p>Color: {color}</p>
      <p>Width: {width}</p>
      <button onClick={() => setColor(colors[rand()])}>Change color</button>
      <button onClick={() => setWidth(widths[rand()])}>Change width</button>
      <button onClick={() => resetAll()}>Reset all</button>
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
      <ThemingContainer initialData={initialData}>
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
