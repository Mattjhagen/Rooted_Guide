import React, { useState, useEffect, useRef } from 'react';
import { Text, TextStyle, StyleProp, TouchableOpacity, StyleSheet } from 'react-native';

interface TypewriterTextProps {
  text: string;
  speed?: number; // ms per character
  style?: StyleProp<TextStyle>;
  onComplete?: () => void;
}

export function TypewriterText({ text, speed = 25, style, onComplete }: TypewriterTextProps) {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setDisplayedLength(0);
    setIsFinished(false);

    if (!text) {
      setIsFinished(true);
      onCompleteRef.current?.();
      return;
    }

    let currentLength = 0;
    timerRef.current = setInterval(() => {
      currentLength += 1;
      setDisplayedLength(currentLength);

      if (currentLength >= text.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsFinished(true);
        onCompleteRef.current?.();
      }
    }, speed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [text, speed]);

  const handleSkip = () => {
    if (!isFinished) {
      if (timerRef.current) clearInterval(timerRef.current);
      setDisplayedLength(text.length);
      setIsFinished(true);
      onCompleteRef.current?.();
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handleSkip} style={styles.container}>
      <Text style={style}>
        {text.slice(0, displayedLength)}
        {!isFinished && <Text style={styles.cursor}>|</Text>}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  cursor: {
    opacity: 0.6,
    fontWeight: '300',
  },
});
