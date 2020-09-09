import { AudioHTMLAttributes, useEffect, useRef } from 'react';
import React from 'react';

type PropsType = AudioHTMLAttributes<HTMLAudioElement> & {
  srcObject: MediaStream;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function Video({ srcObject, ...props }: PropsType) {
  const refAudio = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (refAudio.current) {
      refAudio.current.srcObject = srcObject;
    }
  }, [srcObject]);

  return <audio ref={refAudio} {...props} autoPlay />;
}
