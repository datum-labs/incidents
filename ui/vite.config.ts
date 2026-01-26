import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isLib = mode === 'lib';

  return {
    plugins: [
      react(),
      isLib &&
        dts({
          include: ['src'],
          exclude: ['src/main.tsx', 'src/**/*.test.tsx', 'src/**/*.stories.tsx'],
        }),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    build: isLib
      ? {
          lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'IncidentsUI',
            formats: ['es', 'cjs'],
            fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
          },
          rollupOptions: {
            external: ['react', 'react-dom', 'react/jsx-runtime'],
            output: {
              globals: {
                react: 'React',
                'react-dom': 'ReactDOM',
                'react/jsx-runtime': 'jsxRuntime',
              },
              assetFileNames: (assetInfo) => {
                if (assetInfo.name === 'style.css') return 'styles.css';
                return assetInfo.name || '';
              },
            },
          },
          cssCodeSplit: false,
          sourcemap: true,
        }
      : {},
  };
});
