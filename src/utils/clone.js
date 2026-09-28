/**
 * Deep copy for plain JSON data. Unlike structuredClone it also accepts Vue/Pinia
 * reactive proxies, which is what stores hand to services.
 */
export const clone = (value) => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)))
