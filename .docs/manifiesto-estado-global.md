# Manifiesto de Estado Global: Soberanía con Zustand
**Versión: 1.0**
**Fecha: 2025-11-23**

## 1. Filosofía: "Estado Atómico y Persistente"

En la evolución de nuestro ecosistema digital hacia una arquitectura de élite, hemos abandonado el uso de React Context para el estado global de la UI en favor de **Zustand**.

### Principios Rectores:
1.  **Cero Provider Hell:** El estado debe vivir fuera del árbol de componentes de React. No más envolturas innecesarias en `layout.tsx`.
2.  **Rendimiento Quirúrgico:** Los componentes solo deben re-renderizarse cuando cambia la porción específica del estado que consumen (`selectors`).
3.  **Persistencia Transparente:** La preferencia del usuario debe sobrevivir a la recarga de página sin lógica manual compleja.

---

## 2. Arquitectura del Store (`ui.store.ts`)

El store de UI es la única fuente de verdad para el estado visual global de la aplicación.

### Estructura Canónica:
```typescript
interface UIState {
  // Estado del Visitor HUD
  isVisitorHudVisible: boolean;
  toggleVisitorHud: () => void;

  // Estado del Menú Móvil
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}
Implementación de Persistencia:
Utilizamos el middleware persist de Zustand.
Storage: localStorage (vía createJSONStorage).
Partialize: Solo persistimos lo que el usuario espera que se recuerde (ej. visibilidad del HUD). El estado efímero (menús abiertos) se descarta.
3. Patrones de Consumo y Seguridad de Hidratación
Al usar persistencia en Next.js (SSR), existe el riesgo de "Hydration Mismatch" (el servidor renderiza el estado por defecto true, el cliente hidrata con localStorage false).
Patrón Obligatorio: "Mounted Guard"
Para componentes que renderizan UI condicional basada en el estado persistido, se debe usar un estado local mounted.
code
TypeScript
// Ejemplo en un componente
const [mounted, setMounted] = useState(false);
const isVisible = useUIStore(s => s.isVisible);

useEffect(() => {
  setMounted(true); // Indica que estamos en el cliente
}, []);

// Renderizado seguro
if (!mounted) return null; // O skeleton
return isVisible ? <Component /> : null;
Este patrón asegura que el HTML inicial coincida con el del servidor, y la actualización al estado del usuario ocurra solo en el cliente, evitando errores de React.
4. Migración de Context a Store
Cualquier nuevo estado global debe seguir este flujo:
Definir la propiedad y acción en UIState (ui.store.ts).
Implementar la lógica en el create del store.
Si requiere persistencia, añadir al array partialize.
Consumir mediante el hook useUIStore seleccionando solo lo necesario.
PROHIBIDO: Crear nuevos React.Context para estado global de UI. Context se reserva para inyección de dependencias estáticas o estado compuesto muy localizado.

---

