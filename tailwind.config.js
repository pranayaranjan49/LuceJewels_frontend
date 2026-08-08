/**
 * Re-themed from the original black/maroon "heirloom vault" look to a warm
 * pinkish-white palette closer to Tanishq's actual site, per explicit
 * request. Deliberately deviating from the literal design-system tokens
 * (which specify a black surface.base and a blue text.tertiary) - those
 * read as a dark dashboard theme, not the soft, light, gold-accented retail
 * look Tanishq is known for and that was asked for by name. Token *names*
 * are unchanged from the original build, only their *values* - this means
 * every existing component reskins automatically without touching each
 * file's className strings.
 */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          base: '#fffbf9',    // warm white page background
          muted: '#fdf1f0',   // soft blush - cards, inputs, skeletons
          raised: '#fbe4e4',  // deeper blush - card surfaces
          strong: '#e7a9b4',  // rose accent - borders, badges
        },
        ink: {
          primary: '#3a2226',   // warm near-black, for headings/body text
          secondary: '#6f5257', // muted rose-grey, secondary text
          tertiary: '#b34760',  // rose-pink accent, for links/tags
          inverse: '#8c7378',   // soft muted grey, tertiary/meta text
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
      boxShadow: {
        soft: '0px 24px 36px -20px rgba(0, 0, 0, 0.08)',
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
