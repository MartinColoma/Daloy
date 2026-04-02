import AppRoutes from "./routes/AppRoutes";

/**
 * App.tsx
 * Root component. Thin by design — all layout logic lives in layouts/,
 * all routing lives in routes/AppRoutes.tsx.
 *
 * When RootLayout is ready, wrap <AppRoutes /> with it here:
 *   import RootLayout from "@/layouts";
 *   <RootLayout><AppRoutes /></RootLayout>
 */
export default function App() {
  return <AppRoutes />;
}