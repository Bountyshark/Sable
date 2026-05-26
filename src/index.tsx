import './instrument';
import { createRoot } from 'react-dom/client';
import { enableMapSet } from 'immer';
import '@fontsource-variable/nunito';
import '@fontsource-variable/nunito/wght-italic.css';
import '@fontsource/space-mono/400.css';
import '@fontsource/space-mono/700.css';
import '@fontsource/space-mono/400-italic.css';
import '@fontsource/space-mono/700-italic.css';
import 'folds/dist/style.css';
import { configClass, varsClass } from 'folds';
import App from './app/pages/App';
import './app/i18n';
import './index.css';
import './app/styles/themes.css';
import './app/styles/overrides/General.css';
import './app/styles/overrides/Privacy.css';
import { createLogger } from './app/utils/debug';
import { installConsolePasteScamWarning } from './app/utils/consolePasteScamWarning';
import { registerAppServiceWorker } from './serviceWorkerBootstrap';

enableMapSet();
installConsolePasteScamWarning();
const log = createLogger('index');

document.body.classList.add(configClass, varsClass);

registerAppServiceWorker();

const injectIOSMetaTags = () => {
  const metaTags = [
    { name: 'theme-color', content: '#0C0B0F' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    {
      name: 'apple-mobile-web-app-status-bar-style',
      content: 'black-translucent',
    },
  ];

  metaTags.forEach((tag) => {
    let element = document.querySelector(`meta[name="${tag.name}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute('name', tag.name);
      document.head.appendChild(element);
    }
    element.setAttribute('content', tag.content);
  });
};

injectIOSMetaTags();

// Handle chunk loading failures with automatic retry
const CHUNK_RETRY_KEY = 'cinny_chunk_retry_count';
const MAX_CHUNK_RETRIES = 2;

window.addEventListener('error', (event) => {
  const isChunkLoadError =
    event.message?.includes('dynamically imported module') ||
    event.message?.includes('Failed to fetch') ||
    event.error?.name === 'ChunkLoadError';

  if (isChunkLoadError) {
    const retryCount = parseInt(sessionStorage.getItem(CHUNK_RETRY_KEY) ?? '0', 10);

    if (retryCount < MAX_CHUNK_RETRIES) {
      sessionStorage.setItem(CHUNK_RETRY_KEY, String(retryCount + 1));
      log.warn(`Chunk load failed, reloading (attempt ${retryCount + 1}/${MAX_CHUNK_RETRIES})`);
      window.location.reload();
      event.preventDefault();
    } else {
      sessionStorage.removeItem(CHUNK_RETRY_KEY);
      log.error('Chunk load failed after max retries, showing error');
    }
  }
});

window.addEventListener('load', () => {
  sessionStorage.removeItem(CHUNK_RETRY_KEY);
});

const mountApp = () => {
  const rootContainer = document.getElementById('root');

  if (rootContainer === null) {
    throw new Error('Root container element not found!');
  }

  const root = createRoot(rootContainer);
  root.render(<App />);
};

mountApp();