import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      text: string;
      white: string;
    };
    fonts: {
      primary: string;
    };
    spacing: {
      small: string;
      medium: string;
      large: string;
    };
  }
}