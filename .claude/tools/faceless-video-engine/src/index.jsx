import { registerRoot } from 'remotion';
import { TikTokVideo } from './TikTokVideo';
import { getScript } from './scripts';

// Root component that renders all compositions
export const RemotionRoot = () => {
  return null;
};

// Register compositions for each video
registerRoot(() => {
  const { Composition } = require('remotion');

  return (
    <>
      {/* P01 - Automation Fails Quietly */}
      <Composition
        id="P01"
        component={() => <TikTokVideo script={getScript('P01')} />}
        durationInFrames={30 * 35} // 35 seconds at 30fps
        fps={30}
        width={1080}
        height={1920}
      />

      {/* P02 - Manual Steps Drift */}
      <Composition
        id="P02"
        component={() => <TikTokVideo script={getScript('P02')} />}
        durationInFrames={30 * 35}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* P03 - Dashboards Give False Comfort */}
      <Composition
        id="P03"
        component={() => <TikTokVideo script={getScript('P03')} />}
        durationInFrames={30 * 35}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* P04 - Busy Looks Like Progress */}
      <Composition
        id="P04"
        component={() => <TikTokVideo script={getScript('P04')} />}
        durationInFrames={30 * 35}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
});