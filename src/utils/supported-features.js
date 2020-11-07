const supports = {
  scheduling() {
    return (
      typeof window !== 'undefined' && typeof MessageChannel === 'function'
    );
  },
};

export default supports;
