import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  prefix: 'incidents-',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--incidents-border))',
        input: 'hsl(var(--incidents-input))',
        ring: 'hsl(var(--incidents-ring))',
        background: 'hsl(var(--incidents-background))',
        foreground: 'hsl(var(--incidents-foreground))',
        primary: {
          DEFAULT: 'hsl(var(--incidents-primary))',
          foreground: 'hsl(var(--incidents-primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--incidents-secondary))',
          foreground: 'hsl(var(--incidents-secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--incidents-destructive))',
          foreground: 'hsl(var(--incidents-destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--incidents-muted))',
          foreground: 'hsl(var(--incidents-muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--incidents-accent))',
          foreground: 'hsl(var(--incidents-accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--incidents-popover))',
          foreground: 'hsl(var(--incidents-popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--incidents-card))',
          foreground: 'hsl(var(--incidents-card-foreground))',
        },
        // Incident-specific colors
        severity: {
          critical: 'hsl(var(--incidents-severity-critical))',
          high: 'hsl(var(--incidents-severity-high))',
          medium: 'hsl(var(--incidents-severity-medium))',
          low: 'hsl(var(--incidents-severity-low))',
        },
        status: {
          active: 'hsl(var(--incidents-status-active))',
          resolved: 'hsl(var(--incidents-status-resolved))',
          drill: 'hsl(var(--incidents-status-drill))',
        },
        task: {
          todo: 'hsl(var(--incidents-task-todo))',
          progress: 'hsl(var(--incidents-task-progress))',
          done: 'hsl(var(--incidents-task-done))',
        },
      },
      borderRadius: {
        lg: 'var(--incidents-radius)',
        md: 'calc(var(--incidents-radius) - 2px)',
        sm: 'calc(var(--incidents-radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
