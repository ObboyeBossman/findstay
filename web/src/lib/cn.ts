import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * The ONLY way to combine class names in FindStay.
 *
 * tailwind-merge does not know our token class names (text-label, h-control-md, z-nav ...) and,
 * unconfigured, will treat `text-label` as a colour and silently drop it next to `text-inverse`.
 * This instance teaches it the token vocabulary. When you add a token class name to
 * tailwind.config.js, add it here too (see .rules/06-design-system-and-theming.md).
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      spacing: ['control-sm', 'control-md', 'control-lg', 'icon-sm', 'icon-md', 'icon-lg'],
    },
    classGroups: {
      'font-size': [{ text: ['display', 'h1', 'h2', 'h3', 'h4', 'body-lg', 'body', 'label', 'caption'] }],
      'font-family': [{ font: ['headline', 'body'] }],
      'font-weight': [{ font: ['regular', 'medium', 'black'] }],
      leading: [{ leading: ['heading', 'body', 'label'] }],
      'border-w': [{ border: ['strong'] }],
      z: [{ z: ['base', 'dropdown', 'sticky', 'nav', 'overlay', 'modal', 'toast'] }],
      duration: [{ duration: ['fast', 'base', 'slow'] }],
      ease: [{ ease: ['standard'] }],
      opacity: [{ opacity: ['disabled'] }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
