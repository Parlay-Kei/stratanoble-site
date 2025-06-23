// vite.config.ts
import { defineConfig } from "file:///C:/Users/Aspir/Mr%20Hubbard/Strata%20Noble/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Aspir/Mr%20Hubbard/Strata%20Noble/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { VitePWA } from "file:///C:/Users/Aspir/Mr%20Hubbard/Strata%20Noble/node_modules/vite-plugin-pwa/dist/index.js";
import compression from "file:///C:/Users/Aspir/Mr%20Hubbard/Strata%20Noble/node_modules/vite-plugin-compression/dist/index.mjs";
import { resolve } from "path";
var __vite_injected_original_dirname = "C:\\Users\\Aspir\\Mr Hubbard\\Strata Noble";
var vite_config_default = defineConfig({
  plugins: [
    react({
      fastRefresh: true
    }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
      manifest: {
        name: "Strata Noble",
        short_name: "StrataNoble",
        description: "Strata Noble Marketing Website",
        theme_color: "#ffffff",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    }),
    compression({
      algorithm: "gzip",
      ext: ".gz"
    }),
    compression({
      algorithm: "brotliCompress",
      ext: ".br"
    })
  ],
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "./src"),
      "@components": resolve(__vite_injected_original_dirname, "./src/components"),
      "@assets": resolve(__vite_injected_original_dirname, "./src/assets"),
      "@lib": resolve(__vite_injected_original_dirname, "./src/lib"),
      "@hooks": resolve(__vite_injected_original_dirname, "./src/hooks"),
      "@utils": resolve(__vite_injected_original_dirname, "./src/utils")
    }
  },
  build: {
    target: "esnext",
    minify: "terser",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "ui-vendor": ["@headlessui/react", "@heroicons/react", "framer-motion"]
        }
      }
    }
  },
  server: {
    port: 8080,
    strictPort: true,
    host: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBc3BpclxcXFxNciBIdWJiYXJkXFxcXFN0cmF0YSBOb2JsZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcQXNwaXJcXFxcTXIgSHViYmFyZFxcXFxTdHJhdGEgTm9ibGVcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL0FzcGlyL01yJTIwSHViYmFyZC9TdHJhdGElMjBOb2JsZS92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcclxuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXB3YSdcclxuaW1wb3J0IGNvbXByZXNzaW9uIGZyb20gJ3ZpdGUtcGx1Z2luLWNvbXByZXNzaW9uJ1xyXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCdcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVhY3Qoe1xyXG4gICAgICBmYXN0UmVmcmVzaDogdHJ1ZSxcclxuICAgIH0pLFxyXG4gICAgVml0ZVBXQSh7XHJcbiAgICAgIHJlZ2lzdGVyVHlwZTogJ2F1dG9VcGRhdGUnLFxyXG4gICAgICBpbmNsdWRlQXNzZXRzOiBbJ2Zhdmljb24uaWNvJywgJ3JvYm90cy50eHQnLCAnYXBwbGUtdG91Y2gtaWNvbi5wbmcnXSxcclxuICAgICAgbWFuaWZlc3Q6IHtcclxuICAgICAgICBuYW1lOiAnU3RyYXRhIE5vYmxlJyxcclxuICAgICAgICBzaG9ydF9uYW1lOiAnU3RyYXRhTm9ibGUnLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnU3RyYXRhIE5vYmxlIE1hcmtldGluZyBXZWJzaXRlJyxcclxuICAgICAgICB0aGVtZV9jb2xvcjogJyNmZmZmZmYnLFxyXG4gICAgICAgIGljb25zOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNyYzogJ3B3YS0xOTJ4MTkyLnBuZycsXHJcbiAgICAgICAgICAgIHNpemVzOiAnMTkyeDE5MicsXHJcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzcmM6ICdwd2EtNTEyeDUxMi5wbmcnLFxyXG4gICAgICAgICAgICBzaXplczogJzUxMng1MTInLFxyXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJ1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIF1cclxuICAgICAgfVxyXG4gICAgfSksXHJcbiAgICBjb21wcmVzc2lvbih7XHJcbiAgICAgIGFsZ29yaXRobTogJ2d6aXAnLFxyXG4gICAgICBleHQ6ICcuZ3onLFxyXG4gICAgfSksXHJcbiAgICBjb21wcmVzc2lvbih7XHJcbiAgICAgIGFsZ29yaXRobTogJ2Jyb3RsaUNvbXByZXNzJyxcclxuICAgICAgZXh0OiAnLmJyJyxcclxuICAgIH0pLFxyXG4gIF0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgJ0AnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJyksXHJcbiAgICAgICdAY29tcG9uZW50cyc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvY29tcG9uZW50cycpLFxyXG4gICAgICAnQGFzc2V0cyc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvYXNzZXRzJyksXHJcbiAgICAgICdAbGliJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9saWInKSxcclxuICAgICAgJ0Bob29rcyc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvaG9va3MnKSxcclxuICAgICAgJ0B1dGlscyc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvdXRpbHMnKSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgdGFyZ2V0OiAnZXNuZXh0JyxcclxuICAgIG1pbmlmeTogJ3RlcnNlcicsXHJcbiAgICBzb3VyY2VtYXA6IHRydWUsXHJcbiAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgIG91dHB1dDoge1xyXG4gICAgICAgIG1hbnVhbENodW5rczoge1xyXG4gICAgICAgICAgJ3JlYWN0LXZlbmRvcic6IFsncmVhY3QnLCAncmVhY3QtZG9tJ10sXHJcbiAgICAgICAgICAndWktdmVuZG9yJzogWydAaGVhZGxlc3N1aS9yZWFjdCcsICdAaGVyb2ljb25zL3JlYWN0JywgJ2ZyYW1lci1tb3Rpb24nXSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG4gIHNlcnZlcjoge1xyXG4gICAgcG9ydDogODA4MCxcclxuICAgIHN0cmljdFBvcnQ6IHRydWUsXHJcbiAgICBob3N0OiB0cnVlLFxyXG4gIH0sXHJcbn0pICJdLAogICJtYXBwaW5ncyI6ICI7QUFBa1QsU0FBUyxvQkFBb0I7QUFDL1UsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsZUFBZTtBQUN4QixPQUFPLGlCQUFpQjtBQUN4QixTQUFTLGVBQWU7QUFKeEIsSUFBTSxtQ0FBbUM7QUFPekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLE1BQ0osYUFBYTtBQUFBLElBQ2YsQ0FBQztBQUFBLElBQ0QsUUFBUTtBQUFBLE1BQ04sY0FBYztBQUFBLE1BQ2QsZUFBZSxDQUFDLGVBQWUsY0FBYyxzQkFBc0I7QUFBQSxNQUNuRSxVQUFVO0FBQUEsUUFDUixNQUFNO0FBQUEsUUFDTixZQUFZO0FBQUEsUUFDWixhQUFhO0FBQUEsUUFDYixhQUFhO0FBQUEsUUFDYixPQUFPO0FBQUEsVUFDTDtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFVBQ1I7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsVUFDUjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsSUFDRCxZQUFZO0FBQUEsTUFDVixXQUFXO0FBQUEsTUFDWCxLQUFLO0FBQUEsSUFDUCxDQUFDO0FBQUEsSUFDRCxZQUFZO0FBQUEsTUFDVixXQUFXO0FBQUEsTUFDWCxLQUFLO0FBQUEsSUFDUCxDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxNQUMvQixlQUFlLFFBQVEsa0NBQVcsa0JBQWtCO0FBQUEsTUFDcEQsV0FBVyxRQUFRLGtDQUFXLGNBQWM7QUFBQSxNQUM1QyxRQUFRLFFBQVEsa0NBQVcsV0FBVztBQUFBLE1BQ3RDLFVBQVUsUUFBUSxrQ0FBVyxhQUFhO0FBQUEsTUFDMUMsVUFBVSxRQUFRLGtDQUFXLGFBQWE7QUFBQSxJQUM1QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQSxJQUNYLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNOLGNBQWM7QUFBQSxVQUNaLGdCQUFnQixDQUFDLFNBQVMsV0FBVztBQUFBLFVBQ3JDLGFBQWEsQ0FBQyxxQkFBcUIsb0JBQW9CLGVBQWU7QUFBQSxRQUN4RTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLElBQ1osTUFBTTtBQUFBLEVBQ1I7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
