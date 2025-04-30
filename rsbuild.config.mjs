import path from 'node:path'
import fs from 'node:fs'
import { defineConfig } from '@rsbuild/core'
import { pluginVue2 } from '@rsbuild/plugin-vue2'

export default defineConfig({
  source: {
    entry: {
      index: './src/main.js'
    }
  },
  html: {
    template: './index.html'
  },
  plugins: [pluginVue2()],
  tools: {
    rspack: {
      plugins:
        process.env.NODE_ENV === 'production'
          ? [
              {
                name: 'rspack:content-unicode',
                apply(compiler) {
                  compiler.hooks.afterEmit.tapPromise(
                    'ContentUnicodePlugin',
                    async (compilation) => {
                      // 构建输出目录
                      const distDir = compilation.outputOptions.path
                      // 获取所有资源列表
                      const assets = compilation.getAssets()

                      await Promise.all(
                        assets.map(async ({ name }) => {
                          if (!name.endsWith('.css')) return

                          const filePath = path.join(distDir, name)
                          let css = await fs.promises.readFile(filePath, 'utf-8')
                          css = css.replace(
                            /content:\s*(['"])(.*?)\1/g,
                            (match, quote, contentStr) => {
                              const encoded = [...contentStr]
                                .map((char) => {
                                  const code = char.charCodeAt(0)
                                  if (code > 255) {
                                    // 小写 Unicode，并补齐到 4 位
                                    return '\\' + code.toString(16).toUpperCase().padStart(4, '0')
                                  }
                                  return char
                                })
                                .join('')
                              return `content: ${quote}${encoded}${quote}`
                            }
                          )
                          await fs.promises.writeFile(filePath, css, 'utf-8')
                        })
                      )
                    }
                  )
                }
              }
            ]
          : []
    }
  }
})
