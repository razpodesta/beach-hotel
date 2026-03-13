/**
 * Define las propiedades configurables para el componente BlurText.
 */
type BlurTextProps = {
    /** El texto que se va a animar. */
    text: string;
    /** El retardo en milisegundos entre la animación de cada palabra o letra. */
    delay?: number;
    /** Clases de Tailwind CSS para aplicar estilo al contenedor. */
    className?: string;
    /** Determina si la animación se aplica a 'words' (palabras) o 'letters' (letras). */
    animateBy?: 'words' | 'letters';
    /** La dirección desde la que aparece el texto ('top' o 'bottom'). */
    direction?: 'top' | 'bottom';
    /** Función a ejecutar cuando la animación completa ha terminado. */
    onAnimationComplete?: () => void;
};
/**
 * Componente que renderiza texto con una animación de desenfoque al entrar en el viewport.
 */
export declare function BlurText({ text, delay, className, animateBy, direction, onAnimationComplete, }: BlurTextProps): import("react/jsx-runtime").JSX.Element;
export {};
