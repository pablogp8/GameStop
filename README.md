# BotonStop

## Documentación

- [Manual de usuario](docs/MANUAL_USUARIO.md)
- [Manual de usuario en Word](docs/Manual_de_usuario_STOP_TEN.docx)
- [Manual técnico](docs/MANUAL_TECNICO.md)

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.7.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Android

La aplicación usa Capacitor 8 y requiere OpenJDK 21, Android SDK Platform 36 y Build Tools 35.

Sincronizar Angular con el proyecto nativo:

```bash
npm run android:sync
```

Abrir el proyecto en Android Studio:

```bash
npm run android:open
```

Generar un APK de depuración:

```bash
npm run android:apk
```

El APK completo se genera en `android/app/build/outputs/apk/full/debug/app-full-debug.apk`.

Generar la variante demo con cinco días desde la primera apertura:

```bash
npm run android:apk:demo
```

El APK demo se genera en `android/app/build/outputs/apk/demo/debug/app-demo-debug.apk` y puede instalarse junto a la versión completa.

La app Android bloquea la orientación vertical, mantiene la pantalla encendida, oculta las barras del sistema y ofrece retroalimentación háptica al iniciar, detener y ganar.
