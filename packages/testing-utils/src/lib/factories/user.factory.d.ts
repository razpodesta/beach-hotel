type TestUser = {
    id: string;
    email: string;
    username: string;
    privilege: 'user' | 'admin' | 'god';
    active: boolean;
};
/**
 * Construye un objeto de usuario de prueba con datos realistas generados por faker-js.
 * Permite la sobreescritura de cualquier propiedad para adaptarse a escenarios de
 * prueba específicos.
 *
 * @param {Partial<TestUser>} overrides - Un objeto con las propiedades que se desean sobreescribir.
 * @returns {TestUser} Un objeto de usuario de prueba completo y tipado.
 */
export declare const buildUser: (overrides?: Partial<TestUser>) => TestUser;
export {};
