import { definePreset, palette } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const ReddocPreset = definePreset(Aura, {
  primitive: {
    navy: palette('#009ef7'),
    sky: palette('#13263c'),
  },
  semantic: {
    primary: {
      50: '{navy.50}',
      100: '{navy.100}',
      200: '{navy.200}',
      300: '{navy.300}',
      400: '{navy.400}',
      500: '{navy.500}',
      600: '{navy.600}',
      700: '{navy.700}',
      800: '{navy.800}',
      900: '{navy.900}',
      950: '{navy.950}',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{navy.500}',
          inverseColor: '#ffffff',
          hoverColor: '{navy.600}',
          activeColor: '{navy.700}',
        },
        highlight: {
          background: '{navy.50}',
          focusBackground: '{navy.100}',
          color: '{navy.700}',
          focusColor: '{navy.800}',
        },
      },
      dark: {
        primary: {
          color: '{navy.400}',
          inverseColor: '{sky.950}',
          hoverColor: '{navy.300}',
          activeColor: '{navy.200}',
        },
        highlight: {
          background: 'rgba(0, 158, 247, 0.16)',
          focusBackground: 'rgba(0, 158, 247, 0.24)',
          color: 'rgba(255, 255, 255, 0.87)',
          focusColor: 'rgba(255, 255, 255, 0.87)',
        },
      },
    },
  },
});
