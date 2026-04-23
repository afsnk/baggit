import {
  RootRoute,
  Route,
  Router,
} from "@tanstack/react-router";
import RootLayout from "../routes/Root";
import Home from "../routes/Home";
import Wallet from "../routes/Wallet";
import Buy from "../routes/Buy";
import Sell from "../routes/Sell";

// Root route
const rootRoute = new RootRoute({
  component: RootLayout,
});

// Home route
const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

// Wallet route
const walletRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/wallet",
  component: Wallet,
});

// Buy route
const buyRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/buy",
  component: Buy,
});

// Sell route
const sellRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/sell",
  component: Sell,
});

// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  walletRoute,
  buyRoute,
  sellRoute,
]);

// Create router instance
export const router = new Router({ routeTree });

// Register router for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
