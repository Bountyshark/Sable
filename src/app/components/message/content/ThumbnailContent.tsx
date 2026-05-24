import type { ReactNode } from 'react';
import { useCallback, useEffect } from 'react';
import type { IThumbnailContent } from '$types/matrix/common';
import { useMatrixClient } from '$hooks/useMatrixClient';
import { AsyncStatus, useAsyncCallback } from '$hooks/useAsyncCallback';
import { pushMediaDebugEntry } from '$utils/mediaDebug';
import { decryptFile, downloadEncryptedMedia, mxcUrlToHttp } from '$utils/matrix';
import { useMediaAuthentication } from '$hooks/useMediaAuthentication';
import { FALLBACK_MIMETYPE } from '$utils/mimeTypes';

export type ThumbnailContentProps = {
  info: IThumbnailContent;
  renderImage: (src: string) => ReactNode;
};
export function ThumbnailContent({ info, renderImage }: ThumbnailContentProps) {
  const mx = useMatrixClient();
  const useAuthentication = useMediaAuthentication();

  const [thumbSrcState, loadThumbSrc] = useAsyncCallback(
    useCallback(async () => {
      const thumbInfo = info.thumbnail_info;
      const thumbMxcUrl = info.thumbnail_file?.url ?? info.thumbnail_url;
      const encInfo = info.thumbnail_file;
      if (typeof thumbMxcUrl !== 'string' || typeof thumbInfo?.mimetype !== 'string') {
        throw new Error('Failed to load thumbnail');
      }

      pushMediaDebugEntry('media.render', 'ThumbnailContent resolving source', {
        component: 'ThumbnailContent',
        rawUrl: thumbMxcUrl,
        mimeType: thumbInfo.mimetype,
        encrypted: Boolean(encInfo),
        useAuthentication: Boolean(useAuthentication),
      });
      const mediaUrl = mxcUrlToHttp(mx, thumbMxcUrl, useAuthentication);
      if (!mediaUrl) throw new Error('Invalid media URL');
      if (encInfo) {
        const fileContent = await downloadEncryptedMedia(mediaUrl, (encBuf) =>
          decryptFile(encBuf, thumbInfo.mimetype ?? FALLBACK_MIMETYPE, encInfo)
        );
        const objectUrl = URL.createObjectURL(fileContent);
        pushMediaDebugEntry('media.render.result', 'ThumbnailContent using encrypted object URL', {
          component: 'ThumbnailContent',
          rawUrl: thumbMxcUrl,
          resolvedUrl: mediaUrl,
          objectUrl,
          encrypted: true,
        });
        return objectUrl;
      }

      pushMediaDebugEntry('media.render.result', 'ThumbnailContent using direct media URL', {
        component: 'ThumbnailContent',
        rawUrl: thumbMxcUrl,
        resolvedUrl: mediaUrl,
        encrypted: false,
      });
      return mediaUrl;
    }, [mx, info, useAuthentication])
  );

  useEffect(() => {
    loadThumbSrc();
  }, [loadThumbSrc]);

  return thumbSrcState.status === AsyncStatus.Success ? renderImage(thumbSrcState.data) : null;
}
