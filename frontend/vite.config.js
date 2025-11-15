import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'jspdf': path.resolve(__dirname, 'node_modules/jspdf/dist/jspdf.es.min.js'),
      'jspdf-autotable': path.resolve(__dirname, 'node_modules/jspdf-autotable/dist/jspdf.plugin.autotable.mjs')
    }
  },
  optimizeDeps: {
    include: ['jspdf', 'jspdf-autotable', 'mui-datatables', 'xlsx']
  },
  build: {
    commonjsOptions: {
      include: [/jspdf/, /jspdf-autotable/, /mui-datatables/, /xlsx/, /node_modules/],
      transformMixedEsModules: true
    }
  }
})
