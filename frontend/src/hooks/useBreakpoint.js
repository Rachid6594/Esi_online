import { useMediaQuery } from 'react-responsive'

// Ré-export pour des media queries personnalisées
export { useMediaQuery } from 'react-responsive'

/**
 * Breakpoints alignés avec Tailwind CSS :
 * sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px
 */

export const Breakpoint = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

/**
 * Hook : true si la largeur est >= au breakpoint.
 * @param {keyof Breakpoint} min - 'sm' | 'md' | 'lg' | 'xl' | '2xl'
 */
export function useMinWidth(min) {
  const width = Breakpoint[min] ?? min
  return useMediaQuery({ minWidth: width })
}

/**
 * Hook : true si la largeur est < au breakpoint.
 * @param {keyof Breakpoint} max - 'sm' | 'md' | 'lg' | 'xl' | '2xl'
 */
export function useMaxWidth(max) {
  const width = Breakpoint[max] ?? max
  return useMediaQuery({ maxWidth: width - 1 })
}

/** true si écran considéré comme mobile (< 768px, équivalent à avant md) */
export function useIsMobile() {
  return useMaxWidth('md')
}

/** true si écran tablette ou plus (>= 768px) */
export function useIsTabletOrDesktop() {
  return useMinWidth('md')
}

/** true si écran desktop (>= 1024px) */
export function useIsDesktop() {
  return useMinWidth('lg')
}
