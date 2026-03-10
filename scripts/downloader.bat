@echo off
setlocal

:: ===================================================================================
:: SCRIPT DE DESCARGA DE RECURSOS PARA OH HOTEIS
:: ===================================================================================
::
:: Propósito: Descarga los recursos multimedia (imágenes, GIFs) desde la
::            página de inicio de ohhoteis.com.br y los organiza en una
::            carpeta de salida específica.
::
:: Requisitos: curl (incluido en Windows 10/11 y Git Bash).
::
:: Uso:
::   1. Navega a la carpeta 'scripts' en tu terminal.
::   2. Ejecuta el comando: downloader.bat
::
:: ===================================================================================

:: --- CONFIGURACIÓN ---
:: Define la carpeta de salida para los nuevos recursos de la página de inicio.
set "OUTPUT_DIR=downloaded_assets\homepage"
echo Configurando el directorio de salida en: %OUTPUT_DIR%
echo.

:: --- PREPARACIÓN ---
:: Crea el directorio de salida si no existe. El comando `2>nul` suprime
:: el mensaje de error si la carpeta ya existe.
if not exist "%OUTPUT_DIR%" (
    echo Creando directorio: %OUTPUT_DIR%
    mkdir "%OUTPUT_DIR%"
) else (
    echo El directorio %OUTPUT_DIR% ya existe. Los archivos se descargarán aquí.
)
echo.

:: --- PROCESO DE DESCARGA ---
echo Iniciando la descarga de recursos...
echo ====================================================

:: --- Logos y Favicon ---
echo Descargando logos y favicon...
curl -s -S --create-dirs -o "%OUTPUT_DIR%\favicon.png" "https://pages.greatpages.com.br/www.ohhoteis.com.br/1758303546/imagens/desktop/452812-5b74494cd8e4ecda489198bc4118268d.png"
curl -s -S --create-dirs -o "%OUTPUT_DIR%\logo-header-desktop.png" "https://pages.greatpages.com.br/www.ohhoteis.com.br/1758303546/imagens/desktop/2507301_1_66153.png"
curl -s -S --create-dirs -o "%OUTPUT_DIR%\logo-header-mobile.png" "https://pages.greatpages.com.br/www.ohhoteis.com.br/1758303546/imagens/mobile/2507301_1_66153.png"
curl -s -S --create-dirs -o "%OUTPUT_DIR%\logo-footer.png" "https://pages.greatpages.com.br/www.ohhoteis.com.br/1758303546/imagens/desktop/2507301_1_1746725296681ce9b184abc020575760.png"
curl -s -S --create-dirs -o "%OUTPUT_DIR%\logo-footer-cliic.png" "https://pages.greatpages.com.br/www.ohhoteis.com.br/1758303546/imagens/desktop/2507301_1_1746725296681ce9b18b883134384127.png"

:: --- Imágenes del Slider Principal ---
echo Descargando imagenes del slider principal...
curl -s -S --create-dirs -o "%OUTPUT_DIR%\slider-1-floripa.jpg" "https://pages.greatpages.com.br/www.ohhoteis.com.br/1758303546/imagens/mobile/2507301_1_1043764936.jpg"
curl -s -S --create-dirs -o "%OUTPUT_DIR%\slider-2-gramado.jpg" "https://pages.greatpages.com.br/www.ohhoteis.com.br/1758303546/imagens/mobile/2507301_1_104371180771.jpg"
curl -s -S --create-dirs -o "%OUTPUT_DIR%\slider-3-salvador.jpg" "https://pages.greatpages.com.br/www.ohhoteis.com.br/1758303546/imagens/mobile/2507301_1_104379275261.jpg"

:: --- Tarjetas de Unidades (Hoteles) ---
echo Descargando imagenes de las tarjetas de hoteles...
curl -s -S --create-dirs -o "%OUTPUT_DIR%\card-floripa.jpg" "https://pages.greatpages.com.br/www.ohhoteis.com.br/1758303546/imagens/desktop/2507301_1_23286.jpg"
curl -s -S --create-dirs -o "%OUTPUT_DIR%\card-gramado.jpg" "https://pages.greatpages.com.br/www.ohhoteis.com.br/1758303546/imagens/desktop/2507301_1_54312.jpg"
curl -s -S --create-dirs -o "%OUTPUT_DIR%\card-salvador.jpg" "https://pages.greatpages.com.br/www.ohhoteis.com.br/1758303546/imagens/desktop/2507301_1_62783.jpg"

:: --- Slider de Depoimentos/Galería ---
echo Descargando imagenes de la galeria...
curl -s -S --create-dirs -o "%OUTPUT_DIR%\gallery-1.jpg" "https://pages.greatpages.com.br/www.ohhoteis.com.br/1758303546/imagens/mobile/2507301_1_1758303376787204284539456.jpg"
curl -s -S --create-dirs -o "%OUTPUT_DIR%\gallery-2.jpg" "https://pages.greatpages.com.br/www.ohhoteis.com.br/1758303546/imagens/mobile/2507301_1_1758303376787204289387670.jpg"

:: --- Recursos de la Sección de Contacto y Footer ---
echo Descargando recursos de contacto y footer...
curl -s -S --create-dirs -o "%OUTPUT_DIR%\cta-anim-whatsapp.gif" "https://pages.greatpages.com.br/www.ohhoteis.com.br/1758303546/imagens/desktop/2507301_1_174887907786617245.gif"
curl -s -S --create-dirs -o "%OUTPUT_DIR%\icon-instagram.png" "https://pages.greatpages.com.br/www.ohhoteis.com.br/1758303546/imagens/desktop/2507301_1_1746725296681ce9b187657431553453.png"
curl -s -S --create-dirs -o "%OUTPUT_DIR%\icon-whatsapp.png" "https://pages.greatpages.com.br/www.ohhoteis.com.br/1758303546/imagens/desktop/2507301_1_1746725296681ce9b185806453876137.png"

:: --- FINALIZACIÓN ---
echo.
echo ====================================================
echo Proceso de descarga completado.
echo Todos los archivos han sido guardados en la carpeta '%OUTPUT_DIR%'.
echo ====================================================
echo.

endlocal
