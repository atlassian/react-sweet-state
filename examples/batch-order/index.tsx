import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom/client';

import {
  AlphaContainer,
  useAlphaActions,
  useAlphaValue,
} from './controllers/alpha';
import { BetaContainer, useBetaValue } from './controllers/beta';
import { GammaContainer, useGammaValue } from './controllers/gamma';

// uncomment and reload to "fix" behaviour
import { defaults } from 'react-sweet-state';
defaults.batchUpdates = false;

const WiredBetaContainer = (props: { children?: ReactNode }) => {
  console.log('Beta', 'useAlphaValue()', useAlphaValue());
  return <BetaContainer input={useAlphaValue()} {...props} />;
};

const WiredGammaContainer = (props: { children?: ReactNode }) => {
  console.log('Gamma');
  return <GammaContainer input={useBetaValue()} {...props} />;
};

const Delta = () => {
  const alphaValue = useAlphaValue();
  const gammaValue = useGammaValue();

  console.log('Delta', alphaValue, gammaValue);

  const { setValue } = useAlphaActions();

  return (
    <button type="button" onClick={() => setValue((alphaValue ?? 0) + 1)}>
      Update
    </button>
  );
};

function App() {
  return (
    <AlphaContainer>
      <WiredBetaContainer>
        <WiredGammaContainer>
          <Delta />
        </WiredGammaContainer>
      </WiredBetaContainer>
    </AlphaContainer>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
