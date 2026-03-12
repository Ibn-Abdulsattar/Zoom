  // Fake Audio
export const silence = () => {
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();

  const dst = oscillator.connect(ctx.createMediaStreamDestination());

  oscillator.start(0);
  ctx.resume();

  const track = Object.assign(dst.stream.getAudioTracks()[0], {
    enabled: false,
  });
  track.onended = () => ctx.close();

  return track;
};

//Fake video
export const black = ({ width = 640, height = 480 } = {}) => {
  let canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  canvas.getContext("2d").fillRect(0, 0, width, height);
  let stream = canvas.captureStream();

  return Object.assign(stream.getVideoTracks()[0], { enabled: false });
};

// Fake audio + video
export const blackSilence = (...args) =>
  new MediaStream([black(...args), silence()]);
