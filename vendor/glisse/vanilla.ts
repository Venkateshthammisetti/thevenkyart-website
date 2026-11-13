// A framework-free front end for glisse's Liquid Glass engine
// (https://github.com/0kzh/glisse, MIT — see LICENSE beside this file).
//
// glisse ships React components; this site is plain HTML. The engine under
// those components (refraction, lit rim, press spring) doesn't need React,
// so this file wires it to ordinary elements instead:
//
//   <a class="btn" data-glass>…</a>          glass that squishes when pressed
//   <div class="card" data-glass="static">   glass that doesn't
//
//   Glisse.auto(".nav-container", { press: false })   by selector, now and later
//   Glisse.attach(el) / Glisse.detach(el) / Glisse.refit()
//
// Built to js/glisse.js by `npm run build:glass`.

import { press } from "./internal/press";
import { refract, type Fitting } from "./internal/refraction";

export interface AttachOptions {
  /** Grows and stretches under the pointer, as iOS glass buttons do. Default true. */
  press?: boolean;
}

interface Attached {
  fitting: Fitting;
  release?: () => void;
}

const attached = new Map<HTMLElement, Attached>();

/** Makes `element` Liquid Glass. Safe to call twice. */
export function attach(element: HTMLElement, options: AttachOptions = {}): void {
  if (attached.has(element)) return;
  element.classList.add("lg-glass");
  const pressable = options.press ?? true;
  if (pressable) element.setAttribute("data-lg-press", "");
  attached.set(element, {
    fitting: refract(element),
    release: pressable ? press(element) : undefined,
  });
}

/** Turns `element` back into what it was. */
export function detach(element: HTMLElement): void {
  const entry = attached.get(element);
  if (!entry) return;
  entry.fitting.stop();
  entry.release?.();
  attached.delete(element);
  element.classList.remove("lg-glass");
  element.removeAttribute("data-lg-press");
}

/**
 * Redraws the rim and lens of `element`, or of every glass. Size changes are
 * picked up by themselves; call this after changing --lg-* settings in place.
 */
export function refit(element?: HTMLElement): void {
  if (element) attached.get(element)?.fitting.refit();
  else attached.forEach((entry) => entry.fitting.refit());
}

interface Rule {
  selector: string;
  options: AttachOptions;
}

const rules: Rule[] = [{ selector: "[data-glass]", options: {} }];
let observer: MutationObserver | undefined;

function optionsFor(element: HTMLElement, fallback: AttachOptions): AttachOptions {
  const mode = element.getAttribute("data-glass");
  return mode === "static" ? { ...fallback, press: false } : fallback;
}

function scan(root: ParentNode): void {
  for (const { selector, options } of rules) {
    if (root instanceof HTMLElement && root.matches(selector)) attach(root, optionsFor(root, options));
    root.querySelectorAll<HTMLElement>(selector).forEach((element) => attach(element, optionsFor(element, options)));
  }
}

function watch(): void {
  if (observer) return;
  observer = new MutationObserver((records) => {
    for (const record of records) {
      record.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) scan(node);
      });
      record.removedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        for (const element of attached.keys()) {
          if ((element === node || node.contains(element)) && !element.isConnected) detach(element);
        }
      });
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function whenReady(run: () => void): void {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, { once: true });
  else run();
}

/** Makes every element matching `selector` glass, including ones added later. */
export function auto(selector: string, options: AttachOptions = {}): void {
  rules.push({ selector, options });
  whenReady(() => {
    scan(document);
    watch();
  });
}

whenReady(() => {
  scan(document);
  watch();
});
