import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from 'remotion';

// Brand colors
const COLORS = {
  bg: '#0A0A0A',
  primary: '#FFFFFF',
  accent: '#FF0050',
  secondary: '#808080',
};

// Text animations component
const AnimatedText = ({ text, delay = 0, duration = 30, fontSize = 80, color = COLORS.primary }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 100,
      stiffness: 200,
    },
  });

  const scale = spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 100,
      stiffness: 200,
    },
  });

  const translateY = interpolate(
    frame - delay,
    [0, 10],
    [20, 0],
    {
      extrapolateRight: 'clamp',
    }
  );

  return (
    <div
      style={{
        fontSize,
        color,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 700,
        textAlign: 'center',
        opacity,
        transform: `scale(${scale}) translateY(${translateY}px)`,
        padding: '0 60px',
        lineHeight: 1.2,
        textShadow: '0 2px 20px rgba(0,0,0,0.5)',
      }}
    >
      {text}
    </div>
  );
};

// Scene component
const Scene = ({ children, style = {} }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// Hook scene with accent color
const HookScene = ({ text }) => {
  const frame = useCurrentFrame();

  const pulseScale = interpolate(
    Math.sin(frame * 0.1),
    [-1, 1],
    [0.95, 1.05]
  );

  return (
    <Scene>
      <div
        style={{
          width: '90%',
          maxWidth: '900px',
          padding: '60px',
          borderRadius: '30px',
          background: `linear-gradient(135deg, ${COLORS.accent}22, ${COLORS.accent}11)`,
          border: `3px solid ${COLORS.accent}`,
          transform: `scale(${pulseScale})`,
          boxShadow: `0 0 100px ${COLORS.accent}33`,
        }}
      >
        <AnimatedText text={text} fontSize={72} color={COLORS.primary} />
      </div>
    </Scene>
  );
};

// Story scene with visual hierarchy
const StoryScene = ({ text }) => {
  return (
    <Scene>
      <AnimatedText text={text} fontSize={56} color={COLORS.primary} delay={5} />
    </Scene>
  );
};

// Insight scene with emphasis
const InsightScene = ({ text }) => {
  const frame = useCurrentFrame();

  const glowIntensity = interpolate(
    frame,
    [0, 30, 60],
    [0, 1, 0.7],
    {
      extrapolateRight: 'clamp',
    }
  );

  return (
    <Scene>
      <div
        style={{
          padding: '40px',
          background: `radial-gradient(circle, ${COLORS.accent}22 0%, transparent 70%)`,
          opacity: glowIntensity,
        }}
      >
        <AnimatedText text={text} fontSize={64} color={COLORS.accent} delay={5} />
      </div>
    </Scene>
  );
};

// CTA scene with action emphasis
const CTAScene = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bounce = spring({
    frame: frame - 10,
    fps,
    config: {
      damping: 10,
      stiffness: 100,
      mass: 0.5,
    },
  });

  return (
    <Scene>
      <div
        style={{
          transform: `scale(${bounce})`,
        }}
      >
        <AnimatedText text="👇" fontSize={100} delay={0} />
        <div style={{ height: '40px' }} />
        <AnimatedText text={text} fontSize={52} color={COLORS.primary} delay={10} />
      </div>
    </Scene>
  );
};

// Main TikTok video composition
export const TikTokVideo = ({ script }) => {
  const { fps } = useVideoConfig();

  // Parse script sections
  const sections = {
    hook: script.hook || "Your automation is lying to you.",
    story: script.story || "Silent failures compound until they become crises.",
    insight: script.insight || "The real problems happen where you're not looking.",
    cta: script.cta || "What's failing quietly in your business right now?",
  };

  // Timing (in frames at 30fps)
  const timing = {
    hook: { start: 0, duration: fps * 7 },      // 7 seconds
    story: { start: fps * 7, duration: fps * 10 }, // 10 seconds
    insight: { start: fps * 17, duration: fps * 8 }, // 8 seconds
    cta: { start: fps * 25, duration: fps * 10 },    // 10 seconds
  };

  return (
    <>
      <Sequence from={timing.hook.start} durationInFrames={timing.hook.duration}>
        <HookScene text={sections.hook} />
      </Sequence>

      <Sequence from={timing.story.start} durationInFrames={timing.story.duration}>
        <StoryScene text={sections.story} />
      </Sequence>

      <Sequence from={timing.insight.start} durationInFrames={timing.insight.duration}>
        <InsightScene text={sections.insight} />
      </Sequence>

      <Sequence from={timing.cta.start} durationInFrames={timing.cta.duration}>
        <CTAScene text={sections.cta} />
      </Sequence>
    </>
  );
};