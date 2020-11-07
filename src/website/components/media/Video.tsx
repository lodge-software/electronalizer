import { VideoHTMLAttributes, useEffect, useRef } from 'react';
import React from 'react';

type PropsType = VideoHTMLAttributes<HTMLVideoElement> & {
  srcObject: MediaStream;
  isAutoPlay: boolean;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function Video({ srcObject, isAutoPlay, ...props }: PropsType) {
  const refVideo = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!refVideo.current) return;
    refVideo.current.srcObject = srcObject;
  }, [srcObject]);

  return isAutoPlay ? (
    <video ref={refVideo} {...props} autoPlay muted />
  ) : (
      <video ref={refVideo} {...props} autoPlay muted />
    );
}
