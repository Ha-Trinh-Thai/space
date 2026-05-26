import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#f97316',
          'primary-darken-1': '#ea580c',
          secondary: '#1a1a1a',
          accent: '#fb923c',
          success: '#22c55e',
          warning: '#eab308',
          error: '#ef4444',
          info: '#0ea5e9',
          background: '#fafaf9',
          surface: '#ffffff',
          'surface-variant': '#f5f5f4',
          'on-surface-variant': '#57534e',
        },
      },
      dark: {
        colors: {
          primary: '#fb923c',
          'primary-darken-1': '#f97316',
          secondary: '#292524',
          accent: '#fdba74',
          success: '#34d399',
          warning: '#fbbf24',
          error: '#f87171',
          info: '#38bdf8',
          background: '#0c0a09',
          surface: '#1c1917',
          'surface-variant': '#292524',
          'on-surface-variant': '#a8a29e',
        },
      },
    },
  },
  defaults: {
    VBtn: { variant: 'flat', rounded: 'lg' },
    VTextField: { variant: 'outlined', density: 'comfortable', color: 'primary' },
    VSelect: { variant: 'outlined', density: 'comfortable', color: 'primary' },
    VCard: { rounded: 'xl', elevation: 0 },
    VDialog: { maxWidth: 480, transition: 'dialog-bottom-transition' },
    VNavigationDrawer: { elevation: 0 },
    VList: { rounded: 'lg' },
    VListItem: { rounded: 'lg' },
    VChip: { rounded: 'lg' },
    VAlert: { rounded: 'lg', variant: 'tonal' },
    VSkeletonLoader: { elevation: 0 },
  },
});

export default vuetify;
