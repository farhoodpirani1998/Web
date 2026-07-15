import sanitizeHtml, { IOptions } from 'sanitize-html';
import { Translatable } from '../../core/i18n/locale.enum';

/**
 * Allow-list for admin-authored rich text — the `body` field on About,
 * News, Pages, and Events (the modules with a WYSIWYG-editable content
 * field). Deliberately conservative: normal editor output (paragraphs,
 * headings, lists, links, images, basic inline formatting, tables) is
 * preserved; anything not explicitly listed here — scripts, iframes,
 * inline event handlers (onclick etc.), the `style` attribute, forms —
 * is stripped rather than escaped-and-kept (sanitize-html's default
 * `disallowedTagsMode: 'discard'`), so it silently disappears instead
 * of showing up as literal text.
 */
const RICH_TEXT_OPTIONS: IOptions = {
  allowedTags: [
    'p', 'br', 'hr',
    'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'sub', 'sup',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote', 'code', 'pre',
    'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'span', 'div',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height'],
  },
  // No javascript:/data: links or images — only these schemes, and only
  // http(s) for <img src>, so an <img src="javascript:..."> can't slip
  // through as an XSS vector some sanitizers miss.
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: {
    img: ['http', 'https'],
  },
  // Every surviving <a target="_blank"> gets a safe `rel`, regardless of
  // what the editor supplied — prevents reverse-tabnabbing.
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true),
  },
};

export function sanitizeRichTextHtml(html: string): string {
  return sanitizeHtml(html, RICH_TEXT_OPTIONS);
}

/**
 * Applies `sanitizeRichTextHtml` to every locale value of a
 * `Translatable<string>` rich-text field. Used on `body` in
 * AboutService.update / NewsService.create+update /
 * PagesService.create+update / EventsService.create+update,
 * immediately before the entity is saved — never in a public-api
 * controller, so stored data is always already sanitized by the time
 * it's read back out.
 */
export function sanitizeTranslatableRichText(
  value: Translatable<string>,
): Translatable<string> {
  const result: Record<string, string> = {};
  for (const [locale, html] of Object.entries(value)) {
    if (typeof html === 'string') result[locale] = sanitizeRichTextHtml(html);
  }
  return result as Translatable<string>;
}
