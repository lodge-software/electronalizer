import { AudioHTMLAttributes, useEffect, useRef } from 'react';
import React from 'react';

type PropsType = AudioHTMLAttributes<HTMLAudioElement> & {
  srcObject: MediaStream;
  isAutoPlay: boolean;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function Video({ srcObject, isAutoPlay, ...props }: PropsType) {
  const refAudio = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (refAudio.current) {
      refAudio.current.srcObject = srcObject;
    }
  }, [srcObject]);

  return isAutoPlay ? (
    <audio ref={refAudio} {...props} autoPlay muted={true} />
  ) : (
      <audio ref={refAudio} muted={true} {...props} />
    );
}
