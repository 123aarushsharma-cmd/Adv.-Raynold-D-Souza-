import { useFirmBranding } from "./useFirmBranding";
import { getLocalBrandLogo } from "../lib/firebase";
import defaultLogo from "../assets/logo.png";

export function getStoredBrandLogo(): string {
  const local = getLocalBrandLogo();
  if (local && local.trim().length > 0) {
    return local;
  }
  return defaultLogo;
}

export function useBrandLogo() {
  const { logoSrc, isLogoCustom, isLoading, updateLogo, resetLogo } = useFirmBranding();
  return {
    logoSrc,
    isCustom: isLogoCustom,
    isLoading,
    updateLogo,
    resetLogo,
  };
}


