import notificationSound from "../../assets/sounds/mixkit-quick-win-video-game-notification-269.wav";

const play = (volume: number, rate = 1) => {
  if (typeof Audio === "undefined") return;
  const audio = new Audio(notificationSound);
  audio.volume = volume;
  audio.playbackRate = rate;
  void audio.play().catch(() => {
    // Browsers may block audio before a user gesture. The workout flow calls
    // this from taps/swipes, so failures can be safely ignored.
  });
};

export function useWorkoutAudio() {
  return {
    playPrUnlocked: () => play(0.24, 1.08),
    playRestStart: () => play(0.12, 0.95),
    playSetComplete: () => play(0.16),
  };
}
