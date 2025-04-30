import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    createVuePlugin(),
    {
      name: 'vite-plugin-content-unicode',
      apply: 'build',
      enforce: 'post',
      generateBundle(_, bundle) {
        for (const fileName in bundle) {
          const chunk = bundle[fileName]

          if (chunk.type === 'asset' && fileName.endsWith('.css')) {
            let css = chunk.source.toString()

            css = css.replace(/content:\s*(['"])(.*?)\1/g, (match, quote, contentStr) => {
              const converted = [...contentStr]
                .map((char) => {
                  const code = char.charCodeAt(0)
                  if (code > 255) {
                    return '\\' + code.toString(16).toUpperCase().padStart(4, '0')
                  }
                  return char
                })
                .join('')
              return `content: ${quote}${converted}${quote}`
            })

            chunk.source = css
          }
        }
      }
    }
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        additionalData: `@import "element-ui/lib/theme-chalk/index.css";`
      }
    }
  },
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
