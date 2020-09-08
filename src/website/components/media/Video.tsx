import { VideoHTMLAttributes, useEffect, useRef } from 'react';
import React from 'react';

type PropsType = VideoHTMLAttributes<HTMLVideoElement> & {
  srcObject: MediaStream;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function Video({ srcObject, ...props }: PropsType) {
  const refVideo = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!refVideo.current) return;
    refVideo.current.srcObject = srcObject;
  }, [srcObject]);

  return <video ref={refVideo} {...props} autoPlay muted />;
}
