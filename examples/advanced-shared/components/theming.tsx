import { createContainer } from 'react-sweet-state';

export type ThemingContainerProps = {
  initialData?: { width: number; color: string };
};
export const ThemingContainer = createContainer<ThemingContainerProps>();
