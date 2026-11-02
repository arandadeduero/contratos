# Contratación del Ayuntamiento de Aranda de Duero

Descarga los anuncios de contratación del Ayuntamiento de Aranda de Duero publicados en la
[Plataforma de Contratación del Sector Público](https://contrataciondelestado.es), los guarda como JSON en
[`dump/`](dump/) y publica una página de transparencia con los datos.

- **Página de transparencia:** <https://contratos.arandadeduero.es/>
- **Calendario de Contratación (.ics):** <https://contratos.arandadeduero.es/aperturas.ics>
- **Datos abiertos:** <https://contratos.arandadeduero.es/datos/>

## Calendarios

Se pueden suscribir desde cualquier cliente (Google Calendar, Apple, Outlook). Todos usan los mismos identificadores
de evento, así que suscribirse a varios no duplica nada.

| Calendario | URL | Para qué sirve |
| --- | --- | --- |
| Completo | <https://contratos.arandadeduero.es/aperturas.ics> | Todo lo siguiente junto. |
| Mesas de contratación | <https://contratos.arandadeduero.es/mesas.ics> | Aperturas de ofertas (solo las que publica el Ayuntamiento, ver «Datos»). |
| Plazos de licitaciones | <https://contratos.arandadeduero.es/plazos.ics> | `PUB` (publicación) y `ULT. DÍA` (fin del plazo de ofertas, con alarma). |
| Adjudicaciones | <https://contratos.arandadeduero.es/adjudicaciones.ics> | `ADJ` y `ADJ. MENOR`. |
| Vencimientos de contratos | <https://contratos.arandadeduero.es/vencimientos.ics> | `AVISO FIN`: contratos que caducan, con alarma el día antes (según la fecha de fin o duración publicada, ver «Datos»). |

## Feeds

Alternativa abierta al aviso por correo: licitaciones nuevas, adjudicaciones y contratos menores adjudicados de los
últimos 90 días (máximo 200 entradas), con el mismo contenido en dos formatos. Se suscriben desde cualquier lector de
feeds, y la página los anuncia para el descubrimiento automático.

- Atom 1.0: <https://contratos.arandadeduero.es/feed.xml>
- RSS 2.0: <https://contratos.arandadeduero.es/rss.xml>

Las entradas son una foto de los datos del último nocturno (las fechas son las de los anuncios, no la de la consulta).

## Datos abiertos

Página con todos los ficheros y el diccionario de datos: <https://contratos.arandadeduero.es/datos/>

| Fichero | URL |
| --- | --- |
| Contratos (CSV) | <https://contratos.arandadeduero.es/datos/contratos.csv> |
| Contratos (JSON) | <https://contratos.arandadeduero.es/datos/contratos.json> |
| Adjudicatarios (CSV) | <https://contratos.arandadeduero.es/datos/adjudicatarios.csv> |

Más los calendarios y los feeds de arriba. Los anuncios originales descargados de la Plataforma están en [`dump/`](dump/).
Se regeneran cada noche. Los **datos** se publican con licencia
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.es) (reutilización de la información del sector público,
Ley 37/2007), citando: «Ayuntamiento de Aranda de Duero, a partir de la Plataforma de Contratación del Sector Público».
La licencia MIT es solo del código.

## Analítica

La página usa Google Analytics 4 (ID compartido con las webs de fiestas y bienestar animal, `GA_ID` en
`transparencia/site.js`) y **no carga ni envía nada a Google hasta que la persona pulsa «Aceptar»** en el aviso.

- «Aceptar» se recuerda para siempre; «Rechazar» no instala nada y a los 4 días se vuelve a preguntar
  (`DENIED_TTL_DAYS`). La decisión se guarda en `localStorage` (`contratacionAranda:analytics-consent`); sin
  `localStorage` se pregunta en cada visita.
- Con Do Not Track activo no se muestra el aviso ni se carga nada.
- El enlace «Preferencias de analítica» del pie borra la decisión, detiene el seguimiento y vuelve a mostrar el aviso.
- El aviso enlaza a la [política de privacidad](https://www.arandadeduero.es/politica-privacidad/) del Ayuntamiento.
- Funciona igual en la página principal y en `/datos`: un único script (`transparencia/analytics.js`) incrustado por
  `npm run build:site`.

## Qué incluye

- Licitaciones y contratos menores del Ayuntamiento, con adjudicatarios, importes, ofertas y plazos.
- Indicadores y comparativas por corporación (mandato), con la guía de cada indicador.
- Licitaciones con plazo de presentación abierto.
- Calendarios suscribibles, feeds Atom/RSS y datos abiertos en CSV/JSON (ver arriba).

## Cómo funciona

1. `npm run fetch` recorre el feed de la Plataforma y descarga a `dump/` los anuncios nuevos. Guarda un punto de
   control en `dump/.state.json` para recorrer solo lo nuevo, porque el servidor es lento. Si `SEND_EMAILS=1`, avisa
   por email (Amazon SES) de los anuncios nuevos.
2. `npm run build:site` genera en `transparencia/`, a partir de `dump/` y de `transparencia/template.html`, la página
   autocontenida (`index.html`), los cinco calendarios `.ics`, los feeds `feed.xml` y `rss.xml` y la página `/datos`.
3. El workflow [`nightly.yml`](.github/workflows/nightly.yml) lo hace cada noche y a mediodía, copia lo generado a
   `docs/`, sube los datos y despliega la página en GitHub Pages (dominio `contratos.arandadeduero.es`).

## Desarrollo

Requiere Node.js 26 o superior.

```sh
npm install
npm run fetch        # descarga los anuncios nuevos a dump/
npm run build:site   # reconstruye la página, calendarios, feeds y datos
npm run lint
npm test
```

Tras cambiar `transparencia/template.html` o `transparencia/extract.js`, copia lo generado a `docs/` y súbelo: es lo
que publica GitHub Pages.

```sh
cp transparencia/index.html docs/ && cp transparencia/*.ics transparencia/*.xml docs/ && cp transparencia/datos/* docs/datos/
```

Configuración del envío de correos (opcional): `SEND_EMAILS=1`, `NOTIFY_TO` (destinatarios, van siempre en CCO),
`MAIL_FROM`, `AWS_REGION` y las credenciales de AWS. Nunca se escriben en el repositorio.

## Datos

Los datos proceden de fuentes públicas de la Plataforma de Contratación del Sector Público. La página es informativa:
confirma siempre el estado de cada procedimiento en el anuncio original.

Este proyecto **solo agrega lo que hay publicado en la Plataforma**; no crea ni corrige datos. Las mesas de
contratación (aperturas de ofertas) y los vencimientos de los contratos solo aparecen si el departamento de Contratación
del Ayuntamiento los publica, y con las fechas que indique: mantenerlos completos y correctos es trabajo suyo.

## Licencia

El código: [MIT](LICENSE), © 2026 Ayuntamiento de Aranda de Duero. Los datos publicados en `/datos`: CC BY 4.0
(ver «Datos abiertos»).
