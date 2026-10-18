import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    // Session tokens live in browser storage; resolve guards there before rendering.
    renderMode: RenderMode.Client
  }
];
