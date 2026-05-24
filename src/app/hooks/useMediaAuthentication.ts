import { useSpecVersions } from './useSpecVersions';
import { isAndroidTauri } from '$utils/user-agent';

export const useMediaAuthentication = (): boolean => {
  const { versions, unstable_features: unstableFeatures } = useSpecVersions();

  if (isAndroidTauri()) {
    return false;
  }

  // Media authentication is introduced in spec version 1.11
  const authenticatedMedia =
    unstableFeatures?.['org.matrix.msc3916.stable'] || versions.includes('v1.11');

  return authenticatedMedia;
};
