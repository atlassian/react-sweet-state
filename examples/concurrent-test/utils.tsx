import { useEffect } from 'react';

// block for about 20 ms
export const syncBlock = () => {
  const start = Date.now();
  while (Date.now() - start < 20) {
    // empty
  }
};

export const useRegisterIncrementDispatcher = (listener: any) => {
  useEffect(() => {
    const ele = document.querySelector('#remoteIncrement');
    if (!ele) return;

    ele.addEventListener('click', listener);
    return () => {
      ele.removeEventListener('click', listener);
    };
  }, [listener]);
};

// child components
export const ids = [...Array(20).keys()];

// check if all child components show the same count
// and if not, change the title
export const useCheckTearing = () => {
  useEffect(() => {
    const counts = ids.map(i =>
      Number(
        // @ts-ignore
        document.querySelector(`.count:nth-of-type(${i + 1})`).innerHTML
      )
    );
    const res = document.querySelector('#result');
    if (!counts.every(c => c === counts[0])) {
      // @ts-ignore
      res.innerHTML = 'Failed';
      // @ts-ignore
      res.style.color = '#E11';
    }
  });
};
