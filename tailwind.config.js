/** 
 * Design tokens sourced directly from the Tanishq-derived design system (jweleryDesign.md):
 * - surface.base (#000000) / surface.muted (#17191a) / surface.raised (#240606) / surface.strong (#641d1f)
 * - text.primary (#dcdbd8) / text.secondary (#c8c5bf) / text.tertiary (#4aa9f2) / text.inverse (#aba59c)
 * - radius.xs..lg (12/30/50/70px)  - large pill radii -> drives the "vault" signature (see README)
 * - motion durations: instant 150ms / fast 300ms / normal 400ms
 *
 * One deliberate extension: an `accent-gold` scale. The source tokens have no accent color at all,
 * and a jewelry storefront with zero gold is a contradiction of the subject matter. Gold is used only
 * for the signature moments (CTA, price, active nav) - everything else stays strictly on-token.
 */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          base: '#000000',
          muted: '#17191a',
          raised: '#240606',
          strong: '#641d1f',
        },
        ink: {
          primary: '#dcdbd8',
          secondary: '#c8c5bf',
          tertiary: '#4aa9f2',
          inverse: '#aba59c',
        },
        gold: {
          50: '#fbf4e4',
          100: '#f3e2b8',
          200: '#e8cb84',
          300: '#d9ae52',
          400: '#c99730',
          500: '#b8842a',
          600: '#93641f',
          700: '#6e481a',
        },
      },
      fontFamily: {
        sans: ['"Nunito Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'ui-serif', 'Georgia', 'serif'],
      },
      fontSize: {
        xs: '14px',
        sm: '16px',
        md: '18px',
        lg: '20px',
        xl: '22px',
        '2xl': '24px',
        '3xl': '30px',
        '4xl': '40px',
      },
      spacing: {
        1: '2px',
        2: '4px',
        3: '5px',
        4: '6px',
        5: '8px',
        6: '11px',
        7: '12px',
        8: '15px',
      },
      borderRadius: {
        xs: '12px',
        sm: '30px',
        md: '50px',
        lg: '70px',
      },
      transitionDuration: {
        instant: '150ms',
        fast: '300ms',
        normal: '400ms',
      },
    },
  },
  plugins: [],
};
