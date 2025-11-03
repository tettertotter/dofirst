/**
 * VoiceInput Component
 *
 * Hands-free voice input using Web Speech API.
 * Critical for "adding tasks while driving" use case.
 *
 * Research: Voice input is 3x faster than typing on mobile.
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../theme';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { haptics } from '../../utils/haptics';
import { scaleVariants, getAccessibleTransition } from '../../utils/animations';

/**
 * VoiceInput Props
 */
export interface VoiceInputProps {
  /**
   * Callback when transcription is complete
   */
  onTranscript: (text: string) => void;

  /**
   * Callback when recording starts
   */
  onStart?: () => void;

  /**
   * Callback when recording stops
   */
  onStop?: () => void;

  /**
   * Callback on error
   */
  onError?: (error: string) => void;

  /**
   * Language code (e.g., 'en-US', 'es-ES')
   * @default 'en-US'
   */
  language?: string;

  /**
   * Continuous mode (keeps listening)
   * @default false
   */
  continuous?: boolean;

  /**
   * Button size (px)
   * @default 64
   */
  size?: number;

  /**
   * Button variant
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary';

  /**
   * Show transcript preview
   * @default true
   */
  showTranscript?: boolean;

  /**
   * Custom class name
   */
  className?: string;
}

/**
 * VoiceInput Component
 *
 * Features:
 * - Web Speech API integration
 * - Real-time transcript preview
 * - Visual feedback (pulsing animation when listening)
 * - Haptic feedback
 * - Error handling with fallback
 * - Mobile-optimized (large touch target)
 */
export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscript,
  onStart,
  onStop,
  onError,
  language = 'en-US',
  continuous = false,
  size = 64,
  variant = 'primary',
  showTranscript = true,
  className,
}) => {
  const { theme, isDark, resolvedColors } = useTheme();
  const isMobile = useIsMobile();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Check browser support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
        onError?.('Voice input is not supported in this browser');
      }
    }
  }, [onError]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === 'undefined' || !isSupported) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
      haptics.success();
      onStart?.();
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptText = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptText + ' ';
        } else {
          interimTranscript += transcriptText;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      if (finalTranscript) {
        onTranscript(finalTranscript.trim());
        if (!continuous) {
          recognition.stop();
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      haptics.error();
      setIsListening(false);
      onError?.(event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
      onStop?.();
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, continuous, onStart, onStop, onTranscript, onError, isSupported]);

  // Toggle listening
  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setTranscript('');
    } else {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  // Button styles
  const buttonColor = variant === 'primary' ? theme.colors.primary[500] : theme.colors.gray[700];
  const buttonHoverColor = variant === 'primary' ? theme.colors.primary[600] : theme.colors.gray[800];

  const buttonStyles: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: theme.radius.full,
    backgroundColor: buttonColor,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: isDark ? theme.shadows.dark.lg : theme.shadows.light.lg,
    transition: theme.transition.button.value,
    position: 'relative',
  };

  // Pulse animation when listening
  const pulseStyles: React.CSSProperties = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: theme.radius.full,
    backgroundColor: buttonColor,
    opacity: 0.5,
    animation: isListening ? 'pulse 1.5s ease-in-out infinite' : 'none',
  };

  // Microphone icon
  const MicrophoneIcon = () => (
    <svg
      width={size * 0.4}
      height={size * 0.4}
      viewBox="0 0 24 24"
      fill="none"
      stroke={theme.colors.gray[0]}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );

  // Stop icon (when listening)
  const StopIcon = () => (
    <svg
      width={size * 0.35}
      height={size * 0.35}
      viewBox="0 0 24 24"
      fill={theme.colors.gray[0]}
    >
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );

  // Transcript preview styles
  const transcriptStyles: React.CSSProperties = {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: isDark ? resolvedColors.surface.default : theme.colors.gray[50],
    border: `1px solid ${resolvedColors.border.default}`,
    borderRadius: theme.radius.md,
    fontFamily: theme.typography.fonts.primary,
    fontSize: theme.typography.sizes.base.fontSize,
    color: resolvedColors.text.primary,
    minHeight: '60px',
    display: transcript ? 'block' : 'none',
  };

  const keyframesStyle = `
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(1.1); opacity: 0.3; }
    }
  `;

  if (!isSupported) {
    return (
      <div style={{ textAlign: 'center', color: resolvedColors.text.secondary, fontSize: theme.typography.sizes.sm.fontSize }}>
        Voice input is not supported in this browser. Please use Chrome, Safari, or Edge.
      </div>
    );
  }

  return (
    <div className={className} style={{ textAlign: 'center' }}>
      <style>{keyframesStyle}</style>

      {/* Voice Input Button */}
      <motion.button
        style={buttonStyles}
        onClick={toggleListening}
        whileTap={{ scale: 0.95 }}
        whileHover={{ backgroundColor: buttonHoverColor }}
        transition={getAccessibleTransition('button')}
        aria-label={isListening ? 'Stop recording' : 'Start voice input'}
      >
        {isListening && <div style={pulseStyles} />}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {isListening ? <StopIcon /> : <MicrophoneIcon />}
        </div>
      </motion.button>

      {/* Status Text */}
      <div
        style={{
          marginTop: theme.spacing.sm,
          fontSize: theme.typography.sizes.sm.fontSize,
          color: isListening ? theme.colors.primary[500] : resolvedColors.text.secondary,
          fontWeight: isListening ? theme.typography.weights.semibold : theme.typography.weights.normal,
        }}
      >
        {isListening ? 'Listening...' : 'Tap to speak'}
      </div>

      {/* Transcript Preview */}
      {showTranscript && (
        <AnimatePresence>
          {transcript && (
            <motion.div
              style={transcriptStyles}
              variants={scaleVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={getAccessibleTransition('modal')}
            >
              "{transcript}"
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

VoiceInput.displayName = 'VoiceInput';
