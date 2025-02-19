import { AudioHTMLAttributes, useEffect, useRef } from 'react';
import React from 'react';

type PropsType = AudioHTMLAttributes<HTMLAudioElement> & {
  srcObject: MediaStream | undefined;
  isAutoPlay: boolean;
};

export default function Audio({ srcObject, isAutoPlay, ...props }: PropsType): JSX.Element {
  const refAudio = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (refAudio.current && srcObject) {
      refAudio.current.srcObject = srcObject;
    }
  }, [srcObject]);

  return isAutoPlay ? <audio ref={refAudio} {...props} autoPlay /> : <audio ref={refAudio} {...props} />;
}
