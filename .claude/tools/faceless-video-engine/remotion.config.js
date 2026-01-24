import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);

// TikTok optimal settings
Config.setScale(1);
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');

export const config = {
  fps: 30,
  width: 1080,
  height: 1920,
  durationInFrames: 30 * 45, // 45 seconds max
};