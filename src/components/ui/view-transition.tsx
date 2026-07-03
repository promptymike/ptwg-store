import * as React from "react";

type ViewTransitionProps = {
  children: React.ReactNode;
  /** Shared-element identity — same name on both pages creates a morph. */
  name?: string;
  /** Class assigned to the shared transition, e.g. "morph" for CSS hooks. */
  share?: string;
  default?: string;
  enter?: string;
  exit?: string;
};

type ReactWithViewTransition = typeof React & {
  ViewTransition?: React.ComponentType<ViewTransitionProps>;
  unstable_ViewTransition?: React.ComponentType<ViewTransitionProps>;
};

const reactExports = React as ReactWithViewTransition;

/**
 * React's <ViewTransition> resolved across canary naming variants
 * (`ViewTransition` vs `unstable_ViewTransition`). When neither export
 * exists the wrapper renders children untouched, so navigation keeps
 * working — it just doesn't animate. Requires
 * `experimental.viewTransition: true` in next.config.ts.
 */
export const ViewTransition: React.ComponentType<ViewTransitionProps> =
  reactExports.ViewTransition ??
  reactExports.unstable_ViewTransition ??
  (({ children }: ViewTransitionProps) => children);
