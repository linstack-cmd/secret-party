/**
 * Testing utilities and registry for Secret Party
 * 
 * Exports:
 * - initializeRegistry: Initialize window.app in __root.tsx
 * - useRegisterPageApi: Hook for registering page APIs
 * - Type exports: WindowApp, SignupPageApi, LoginPageApi, ProjectListPageApi, etc.
 */

export { initializeRegistry } from "./registry";
export { useRegisterPageApi } from "./useRegisterPageApi";
export type { WindowApp, SignupPageApi, LoginPageApi, ProjectListPageApi } from "./registry.types";
