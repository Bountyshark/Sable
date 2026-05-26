import { hasServiceWorker } from '$utils/platform';
import { useMatrixClient } from './useMatrixClient';
import { useAuthenticatedMediaUrl } from './useAuthenticatedMediaUrl';

export function useMediaSrc(url: string | undefined): string | undefined {
  const mx = useMatrixClient();
  return useAuthenticatedMediaUrl(url, mx.getAccessToken());
}

export function useMediaDownloadToken(): string | null | undefined {
  const mx = useMatrixClient();
  if (hasServiceWorker()) return undefined;
  return mx.getAccessToken();
}