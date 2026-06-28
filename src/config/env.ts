/**
 * Lee una URL de entorno con un fallback robusto.
 *
 * `import.meta.env.X ?? fallback` NO cae cuando la variable está definida pero vacía
 * (`""`), y `""` se resuelve contra el propio origen del sitio → en producción esto
 * rompió chat/API/login cuando Vercel guardó las `VITE_*` vacías. Aquí tratamos el
 * string vacío o de solo espacios como "ausente" y usamos el fallback.
 */
export function envUrl(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim()
  if (!trimmed) return fallback
  // Quita las barras finales (sin regex, para evitar backtracking) y así no
  // duplicar la barra al concatenar rutas: `${base}/api`.
  let end = trimmed.length
  while (end > 0 && trimmed[end - 1] === '/') end--
  return trimmed.slice(0, end)
}
