# Manual de usuario — STOP: El reto de los 10 segundos

## 1. Propósito de la aplicación

STOP es un juego para activaciones comerciales. El participante inicia un cronómetro y debe detenerlo lo más cerca posible de **10.000 segundos**. La aplicación determina si ganó según la tolerancia configurada y la cantidad de premios disponibles durante el día.

La aplicación puede utilizarse en un navegador o como aplicación Android. Actualmente cada dispositivo trabaja de forma local e independiente.

## 2. Acceso y navegación

La barra superior contiene tres opciones:

- **Jugar:** abre la pantalla principal del juego.
- **Ranking:** muestra los diez intentos más cercanos al objetivo guardados en el dispositivo.
- **⚙ Administración:** permite configurar las reglas, consultar el inventario diario de premios y abrir el registro de actividad.

### PIN inicial de administración

El PIN inicial de configuración es **`1234`**.

Por seguridad, se recomienda cambiarlo antes de utilizar la aplicación en una activación real. El nuevo PIN queda guardado únicamente en el dispositivo donde se modificó.

## 3. Cómo jugar

1. Abra la sección **Jugar**.
2. Escriba el nombre del participante. Si se deja vacío, el resultado se guarda como **Anónimo**.
3. Presione **INICIAR**. En una computadora también puede usar la barra espaciadora.
4. Espere hasta considerar que han transcurrido exactamente 10 segundos.
5. Presione **STOP** o vuelva a utilizar la barra espaciadora.
6. La pantalla mostrará **¡GANADOR!** si el intento cumple las reglas; de lo contrario, indicará que no acertó.
7. Presione **JUGAR DE NUEVO** para preparar la siguiente partida.

Cuando se obtiene un resultado ganador, la aplicación muestra una explosión de confeti, reproduce una fanfarria y genera vibración si dichas funciones están disponibles y habilitadas.

## 4. Reglas para declarar un ganador

Un participante obtiene el resultado de ganador solamente cuando se cumplen las dos condiciones siguientes:

1. El tiempo se encuentra dentro de la tolerancia configurada respecto de los 10.000 segundos.
2. Todavía existe un cupo dentro del límite diario de ganadores.

Ejemplo: con una tolerancia de **50 ms**, son válidos los tiempos entre **9.950 y 10.050 segundos**, incluidos ambos extremos.

Si el participante cae dentro de la tolerancia pero ya se alcanzó el límite diario, la pantalla se comporta como un intento no ganador y no entrega premio.

## 5. Premios y descuentos

Si la opción **Descuento aleatorio** está desactivada, el ganador recibe el mensaje general para solicitar su premio al encargado.

Si está activada, cada ganador recibe aleatoriamente uno de estos cupones:

- **5 % de descuento**, presentado con un color distintivo.
- **10 % de descuento**, presentado con un color diferente.

Ambos valores tienen la misma probabilidad. El participante debe mostrar la pantalla al encargado antes de iniciar otra partida.

## 6. Ranking

El ranking muestra los diez resultados locales más cercanos a los 10 segundos. El orden se determina por la diferencia absoluta respecto del objetivo, sin importar si el participante se adelantó o se pasó.

Cuando **Ocultar detalle del resultado** está desactivado, el ranking muestra:

- Posición.
- Nombre del jugador.
- Tiempo obtenido.
- Diferencia respecto del objetivo.

Cuando esa opción está activada, el ranking no muestra tiempos ni diferencias; únicamente presenta la posición, el nombre y el estado **GANADOR** o **INTENTO**.

La opción **Borrar ranking** elimina todos los resultados del dispositivo después de solicitar confirmación. Esta acción no elimina el registro de auditoría.

## 7. Configuración administrativa

1. Presione el icono **⚙**.
2. Ingrese el PIN administrativo. En una instalación nueva es **`1234`**.
3. Modifique las opciones necesarias.
4. Presione **GUARDAR CAMBIOS**.
5. Espere el mensaje **Configuración guardada correctamente**. Si el sonido está habilitado, también se reproduce una confirmación y el dispositivo vibra.

### Opciones disponibles

#### Tolerancia (milisegundos)

Define cuánto puede separarse el resultado de 10.000 segundos y todavía considerarse válido. Un valor menor aumenta la dificultad.

#### Máximo de ganadores por día

Limita la cantidad de premios que puede asignar ese dispositivo durante el día calendario local. El panel muestra ganadores de hoy, premios restantes y límite diario.

Un valor de `0` impide que se declaren ganadores.

#### Ocultar cronómetro

Oculta el tiempo durante la partida a partir del segundo indicado en **Ocultar después de**. Mientras permanece oculto se muestran puntos; el participante debe detener el juego por percepción del tiempo.

#### Ocultar detalle del resultado

Evita mostrar el tiempo obtenido y la diferencia respecto de los 10 segundos. La pantalla solamente indica si el participante ganó o falló. Esta privacidad también se aplica al ranking.

#### Sonidos y vibración

Activa o desactiva conjuntamente:

- Tic-tac acelerado durante la partida.
- Sonido de resultado.
- Fanfarria de ganador.
- Vibración durante el juego y los resultados.
- Confirmación sonora y vibración al guardar la configuración.

La vibración depende del soporte del dispositivo y del navegador.

#### PIN administrativo

Permite sustituir el PIN de acceso. Debe contener entre 4 y 8 caracteres. Guarde el nuevo PIN en un lugar seguro: la aplicación no dispone de recuperación automática.

#### Descuento aleatorio

Activa la asignación aleatoria de descuentos del 5 % o 10 % únicamente para intentos ganadores.

## 8. Registro de actividad

La aplicación registra:

- Cada partida: fecha y hora, jugador, tiempo, diferencia, resultado, descuento y dispositivo.
- Cada configuración guardada: reglas y opciones activadas.

El PIN administrativo nunca se escribe en el log.

Para abrirlo:

1. Ingrese a **Administración**.
2. Presione **ABRIR LOG .TXT**.
3. En Android, elija una aplicación para abrir o compartir `game-stop-log.txt`.
4. En un navegador, se abrirá o descargará un archivo de texto según la configuración del navegador.

El registro conserva como máximo 20,000 eventos por dispositivo.

## 9. Recomendaciones para una activación

- Cambie el PIN inicial `1234` antes de entregar el dispositivo al público.
- Configure y pruebe la tolerancia y el límite diario antes de iniciar.
- Mantenga cargada la tablet y desactive temporalmente las notificaciones externas.
- Realice una partida de prueba para comprobar audio, vibración y volumen.
- Abra o comparta el log al finalizar la jornada para conservar un respaldo.
- No borre los datos del navegador ni desinstale la aplicación antes de exportar la información necesaria.
- Si usa varias tablets, recuerde que cada una lleva por separado su ranking, límite diario, configuración y log.

## 10. Solución de problemas

### No se escucha sonido

Verifique que **Sonidos y vibración** esté activado, que el volumen multimedia no esté silenciado y que el navegador permita reproducir audio.

### El dispositivo no vibra

Algunos navegadores y equipos no admiten vibración. En Android instalado, compruebe también que el sistema permita la respuesta háptica.

### Un tiempo válido no recibió premio

Revise en Administración si ya se alcanzó el máximo diario de ganadores.

### No recuerdo el PIN modificado

No existe recuperación desde la interfaz. Será necesaria una intervención técnica para limpiar la configuración local, lo que restaurará el PIN inicial pero también puede afectar otros datos locales si se elimina todo el almacenamiento.

### Los datos no aparecen en otra tablet

Es el comportamiento esperado de esta versión: la información es local y todavía no se sincroniza por LAN ni por Internet.

