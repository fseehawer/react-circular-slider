import { dts } from 'rollup-plugin-dts';

export default {
  input: '.types/vue/src/index.d.ts',
  output: { file: 'dist/index.d.ts', format: 'es' },
  external: ['vue'],
  plugins: [dts()],
};
