# Third-party notices

## Open-Meteo Weather Map Layer

- Package: [`@openmeteo/weather-map-layer`](https://github.com/open-meteo/weather-map-layer) 0.3.0, which includes `@openmeteo/file-reader`
- Used by: the Weather Radar module's weather layers (`src/services/uc-open-meteo-layer.ts`)
- How it is used: the card loads the package in the browser from jsDelivr, pinned to this exact version, only when a weather layer is turned on. It is not copied into the Ultra Card release files.
- License: the package is published under GPL-2.0. Open-Meteo has given Ultra Card permission to use and bundle it under the MIT license:

  > From our side, you can already use it under MIT and bundle it with your application.

  Patrick Zippenfenig, OpenMeteo GmbH, in reply to ticket #235009, 20 October 2026.

- Weather data: © [Open-Meteo](https://open-meteo.com/), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The map credits Open-Meteo whenever a weather layer is shown.
