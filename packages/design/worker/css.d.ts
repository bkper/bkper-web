/**
 * TypeScript declaration for CSS imports in Cloudflare Workers
 * Wrangler automatically handles .css imports as text strings
 */
declare module '*.css' {
  const content: string;
  export default content;
}
