import { defineManifest } from '@crxjs/vite-plugin'
import packageData from '../package.json'

const isDev = process.env.NODE_ENV === 'development'

export default defineManifest({
  name: `${packageData.displayName || packageData.name}${isDev ? ' ➡️ Dev' : ''}`,
  description: packageData.description,
  version: packageData.version,
  manifest_version: 3,
  icons: {
    16: 'img/logo-16.png',
    32: 'img/logo-34.png',
    48: 'img/logo-48.png',
    128: 'img/logo-128.png'
  },
  action: {
    default_popup: 'popup.html',
    default_title: 'click me'
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module'
  },
  content_scripts: [
    {
      matches: ['https://jamboard.google.com/*'],
      js: ['src/contentScript/index.ts'],
      css: ['src/contentScript/content-script.css']
    }
  ],
  web_accessible_resources: [
    {
      resources: ['img/logo-16.png', 'img/logo-34.png', 'img/logo-48.png', 'img/logo-128.png', 'src/contentScript/content-script.css'],
      matches: []
    }
  ],
  permissions: ['sidePanel', 'storage', 'tabs', 'activeTab']
})
