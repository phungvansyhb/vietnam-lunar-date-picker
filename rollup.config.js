import { defineConfig } from 'rollup'
import sass from 'rollup-plugin-sass'
import typescript from 'rollup-plugin-typescript2'
import pkg from './package.json' assert { type: 'json' }

export default defineConfig({
    input: 'src/index.tsx',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        exports: 'named',
        sourcemap: true,
        strict: false
      },
      {
        file: pkg.module,
        format: 'es',
        sourcemap: true
      }
    ],
    external: [...Object.keys(pkg.peerDependencies || {})],
    plugins: [
      sass({
        output: 'dist/styles.css'
      }),
      typescript({
        useTsconfigDeclarationDir: true,
        tsconfigOverride: {
          compilerOptions: {
            declaration: true,
            declarationDir: './dist'
          }
        }
      })
    ]
  })