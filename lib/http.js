// Descarga de texto con reintentos y límite de tiempo por petición (sin él, una página colgada bloquea la ejecución
// hasta que el cliente se rinde). El límite es holgado: el servidor de la Plataforma llega a tardar varios
// minutos en servir una página de un feed (hasta 15 MB; desde los runners de GitHub superó los 5 min) y un límite
// menor la abortaba una y otra vez.
// `fetchImpl` y `sleep` son inyectables para poder testearlo sin red ni esperas.

// El cortafuegos de la Plataforma responde «Request Rejected» (con HTTP 200) a las peticiones sin User-Agent de
// navegador, que es lo que envía Node por defecto. Con estos encabezados las fichas y los documentos se sirven.
export const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'es-ES,es;q=0.9',
};

const defaultSleep = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

export const fetchText = async (url, {
  fetchImpl = fetch,
  attempts = 3,
  timeoutMs = 600000,
  baseDelayMs = 5000,
  sleep = defaultSleep,
  log = () => {},
} = {}) => {
  for (let attempt = 1; ; attempt += 1) {
    try {
      // la señal cubre la petición y la lectura del cuerpo
      const response = await fetchImpl(url, { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(timeoutMs) });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText ?? ''}`.trim());
      }
      return await response.text();
    } catch (error) {
      if (attempt >= attempts) {
        throw new Error(`No se pudo descargar ${url} tras ${attempts} intentos: ${error.message}`, { cause: error });
      }
      log(`Intento ${attempt} fallido para ${url} (${error.message}); reintentando...`);
      await sleep(attempt * baseDelayMs);
    }
  }
};
