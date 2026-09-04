// esp-web-tools ships its element (<esp-web-install-button>) as a plain
// Web Component with no JSX typings of its own - declare just enough of
// its HTML attribute surface to use it from TSX. See
// node_modules/esp-web-tools/dist/install-button.d.ts for the full
// property list; only the ones Flash.tsx sets are declared here.
import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "esp-web-install-button": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          manifest?: string;
          "erase-first"?: boolean;
        },
        HTMLElement
      >;
    }
  }
}

export {};
