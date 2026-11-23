# Manual técnico — STOP: El reto de los 10 segundos

## 1. Descripción general

STOP es una aplicación Angular standalone empaquetada para Android mediante Capacitor. Su arquitectura actual es **local-first**: no requiere servidor, conexión a Internet ni base de datos externa durante el uso normal.

Datos importantes de la aplicación:

- Nombre: `STOP - Reto 10 segundos`
- Identificador Android: `com.pablogp8.gamestop`
- Objetivo predeterminado: `10,000 ms`
- PIN administrativo inicial: **`1234`**
- Persistencia actual: `localStorage` del navegador o WebView
- Orientación Android: vertical

El punto de entrada `src/main.ts` contiene el encabezado de identificación del desarrollo, con el nombre STOP TEN, descripción, autor, titular del copyright y versión 1.0.0. Este encabezado debe actualizarse al publicar una nueva versión mayor o menor del producto.

> El PIN almacenado localmente es un control operativo, no un mecanismo de seguridad criptográfica. Debe cambiarse antes de una activación y no debe reutilizarse como contraseña sensible.

## 2. Tecnologías y dependencias

- Angular 22 con componentes standalone y signals.
- TypeScript 6.
- RxJS 7.8.
- Capacitor 8 para Android.
- Plugins Capacitor: Filesystem, Haptics, Screen Orientation, Share, Splash Screen y Status Bar.
- Web Audio API para sonidos generados en tiempo real.
- Vibration API como alternativa háptica en navegadores compatibles.
- Gradle para la compilación nativa Android.

Las versiones exactas se encuentran en `package.json` y `package-lock.json`.

## 3. Estructura relevante

```text
src/
  app/
    app.ts                         Lógica y estado de la interfaz
    app.html                       Vistas de juego, ranking y administración
    app.scss                       Estilos de la aplicación
    app.config.ts                  Proveedores e inyección del repositorio
    core/
      game-timer.service.ts        Cronómetro basado en performance.now()
      game-settings.service.ts     Configuración y valores predeterminados
      game-result.model.ts         Modelo de resultados
      results.service.ts           Ranking, dispositivo y conteo diario
      results.repository.ts        Contrato de persistencia
      local-results.repository.ts  Implementación con localStorage
      audio-feedback.service.ts    Sonidos y tic-tac
      audit-log.service.ts         Registro y exportación TXT
public/assets/images/              Recursos gráficos y logotipo
android/                           Proyecto Android nativo generado por Capacitor
capacitor.config.ts                Configuración de Capacitor
```

## 4. Modelo funcional

### Cronómetro

`GameTimerService` usa `performance.now()` para medir tiempo monotónico de alta resolución. `requestAnimationFrame()` actualiza la visualización, pero la medición final se calcula directamente al detener el cronómetro; por ello no depende de la frecuencia de renderizado.

### Evaluación del resultado

Al detener el juego:

```text
diferencia = tiempo_obtenido - tiempo_objetivo
dentro_de_tolerancia = abs(diferencia) <= tolerancia
hay_cupo = ganadores_de_hoy < máximo_diario
ganador = dentro_de_tolerancia AND hay_cupo
```

Si el intento cae dentro de tolerancia pero no quedan cupos, `prizeStatus` se registra como `daily-limit-reached`, aunque la interfaz pública lo muestra como intento no ganador.

### Descuento aleatorio

Cuando está habilitado, un ganador recibe `5` o `10`. La selección utiliza `crypto.getRandomValues()` cuando está disponible y recurre a `Math.random()` como alternativa. Ambas opciones se asignan por paridad del byte, con probabilidad equivalente.

### Ranking

Los resultados se ordenan por `abs(differenceMs)` y la interfaz muestra los primeros diez. La clasificación incluye intentos ganadores y no ganadores.

### Límite diario

El día se calcula con la zona horaria local del dispositivo a partir de `playedAt`. El conteo incluye únicamente registros cuyo campo `isWinner` sea verdadero.

## 5. Persistencia local

Claves utilizadas en `localStorage`:

| Clave | Contenido |
|---|---|
| `boton-stop.settings.v1` | Reglas, opciones y PIN administrativo |
| `boton-stop.results.v1` | Historial completo de resultados locales |
| `boton-stop.device-id` | Identificador generado para la instalación |
| `boton-stop.audit-log.v1` | Hasta 20,000 entradas de auditoría |

Los datos no se cifran y permanecen asociados al origen web o a la WebView instalada. Limpiar los datos de la aplicación, borrar el almacenamiento del sitio o desinstalar la app puede eliminarlos.

### Configuración predeterminada

```text
Objetivo:                  10,000 ms
Tolerancia:                    50 ms
Máximo diario:                 10 ganadores
Ocultar cronómetro:            No
Ocultar desde:              5,000 ms
Ocultar detalle:               No
Sonidos y vibración:           Sí
Descuento aleatorio:           No
PIN inicial:                 1234
```

El objetivo existe en el modelo y permanece en 10 segundos; actualmente no se expone como campo editable en la interfaz administrativa.

## 6. Registro de auditoría

`AuditLogService` registra partidas y guardados de configuración en formato de texto lógico dentro de `localStorage`. El PIN se excluye deliberadamente.

En Android, el servicio crea temporalmente `game-stop-log.txt` en el directorio caché y abre el selector nativo mediante Share. En web crea un `Blob` UTF-8 y abre su URL temporal.

Las fechas internas de cada evento se guardan en ISO 8601/UTC. El encabezado de exportación usa la fecha y hora local del dispositivo.

## 7. Entorno de desarrollo

### Requisitos recomendados

- Windows 10/11 para el flujo documentado.
- Node.js 22 LTS compatible con Angular 22.
- npm 10 o la versión indicada en `package.json`.
- Git.
- Para Android: Android Studio, OpenJDK 21, Android SDK Platform 36 y Build Tools 35.

Es recomendable administrar Node.js con NVM for Windows para aislar la versión del proyecto.

### Instalación

Desde la raíz del repositorio:

```powershell
npm ci
```

`npm ci` instala exactamente las versiones resueltas en `package-lock.json`.

### Servidor de desarrollo

```powershell
npm start
```

El script ejecuta Angular con `--host 0.0.0.0`. En la computadora se accede mediante `http://localhost:4200/`. Desde un teléfono conectado a la misma red Wi-Fi se utiliza:

```text
http://IP_LOCAL_DE_LA_COMPUTADORA:4200/
```

Si el teléfono muestra una pantalla vacía o no conecta:

1. Confirme que ambos equipos estén en la misma red y que no sea una red de invitados con aislamiento entre clientes.
2. Use `ipconfig` para identificar la dirección IPv4 correcta.
3. Permita Node.js o el puerto TCP 4200 en el Firewall de Windows para redes privadas.
4. Evite usar `localhost` desde el teléfono, porque apuntaría al propio teléfono.
5. Compruebe que el servidor siga ejecutándose y revise la consola del navegador.

### Compilación web

```powershell
npm run build
```

La salida se genera en `dist/boton-stop/browser`.

### Pruebas

```powershell
npm test
```

Antes de una entrega se recomienda validar manualmente, como mínimo: inicio/detención, ambos límites de tolerancia, límite diario, privacidad del resultado, ranking, descuentos, guardado de configuración, cambio de PIN, audio, vibración y exportación del log.

## 8. Android con Capacitor

### Sincronizar el proyecto nativo

Cada cambio web debe compilarse y copiarse al proyecto Android:

```powershell
npm run android:sync
```

Este comando ejecuta la compilación Angular y luego `cap sync android`.

### Abrir Android Studio

```powershell
npm run android:open
```

Desde Android Studio puede seleccionar un dispositivo físico con depuración USB o un emulador y ejecutar la aplicación.

### Generar APK de depuración

```powershell
npm run android:apk
```

El archivo resultante queda en:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Este APK es apropiado para pruebas internas. Para distribución formal debe configurarse una clave de firma y generar una versión `release` o un Android App Bundle (`.aab`). La clave privada de firma nunca debe subirse al repositorio.

### Comportamiento nativo

- Orientación bloqueada en vertical.
- Barras del sistema ocultas, recuperables temporalmente mediante gesto.
- Pantalla mantenida encendida durante el uso.
- Splash screen propio.
- Respuesta háptica nativa.
- Exportación del log mediante el selector de compartir de Android.

## 9. Marca y recursos visuales

El logotipo actual se encuentra en:

```text
public/assets/images/genesisE.jfif
```

La identidad principal usa el color mandarina `#FFA800`. Para cambiar el logotipo, conserve la ruta o actualice la referencia en `app.html`, después ejecute nuevamente la sincronización de Android.

## 10. Seguridad y operación

- El PIN inicial es **`1234`** y debe cambiarse en cada dispositivo.
- El PIN se guarda en texto legible dentro del almacenamiento local; no protege contra un usuario con acceso técnico al equipo.
- El log no incluye el PIN.
- No existe autenticación remota ni recuperación de PIN.
- El ranking se puede borrar desde la interfaz, pero esta acción no borra el log.
- La aplicación no valida que una misma persona participe varias veces.
- El cupo diario es local por dispositivo. Con varias tablets, cada una administra su propio máximo.
- Para auditoría formal, exporte el log al finalizar cada jornada y guárdelo fuera del dispositivo.

## 11. Preparación para una arquitectura LAN

La aplicación todavía no sincroniza información entre tablets, pero el patrón `ResultsRepository` deja preparada la sustitución de `LocalResultsRepository` por una implementación remota.

Una evolución recomendada sería:

```text
Tablets Android/Web
        │ HTTPS o HTTP en LAN
        ▼
API central (Node.js/NestJS)
        │
        ▼
Base de datos (PostgreSQL o SQLite para una sola sede)
```

La API debería centralizar resultados, cupos y configuración, porque validar el límite solamente en cada tablet permite entregar más premios que el máximo global. Requisitos mínimos:

- Endpoint transaccional para registrar un intento y asignar el cupo de premio.
- Identificador único por dispositivo e intento para evitar duplicados.
- Hora del servidor como referencia del día de activación.
- Configuración central versionada.
- Cola local para operar durante cortes de red y reintentar sincronización.
- Panel central para ranking, exportación y auditoría.
- Autenticación de dispositivos y protección del panel administrativo.

No debe presentarse el campo actual `syncStatus` como sincronización funcional: en esta versión los registros permanecen con estado local.

## 12. Mantenimiento y diagnóstico

### Restaurar la configuración predeterminada

Desde las herramientas de desarrollo se puede eliminar únicamente `boton-stop.settings.v1`. Al recargar, se restauran los valores iniciales y el PIN `1234`. Esta operación debe realizarla personal autorizado.

### Respaldar datos

El mecanismo soportado por la interfaz es la exportación del log TXT. El ranking no cuenta actualmente con exportación CSV ni restauración automática.

### Revisiones antes de publicar

1. Ejecutar `npm ci` en un entorno limpio.
2. Ejecutar pruebas y `npm run build`.
3. Ejecutar `npm run android:sync`.
4. Probar en el modelo real de tablet.
5. Validar zona horaria y cambio de día.
6. Verificar límites, privacidad y cupones.
7. Cambiar el PIN inicial.
8. Generar y firmar la versión de producción.

