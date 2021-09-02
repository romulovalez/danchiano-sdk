import typescript from '@rollup/plugin-typescript'
import pkg from './package.json'
import { terser } from 'rollup-plugin-terser'

export default {
  input: 'src/index.ts',
  output: [
    { file: pkg.browser, format: 'umd', sourcemap: true, exports: 'named', name: 'Danchiano' },
    { file: pkg.main, format: 'cjs', sourcemap: true, exports: 'named' },
    { file: pkg.module, format: 'es', sourcemap: true },
  ],
  plugins: [
    // Enable declaration output
    // See https://github.com/rollup/plugins/tree/master/packages/typescript#declaration-output-with-outputfile
    typescript({ tsconfig: './tsconfig.json' }),
    terser(),
  ],
}