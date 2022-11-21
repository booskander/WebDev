/* eslint-disable no-magic-numbers */

export function formatTime (seconds) {
  let minutes = Math.floor(seconds / 60);
  minutes = minutes >= 10 ? minutes : "0" + minutes;
  seconds = Math.floor(seconds % 60);
  seconds = seconds >= 10 ? seconds : "0" + seconds;
  return minutes + ":" + seconds;
}

export function modulo (x, m) {
  return ((x % m) + m) % m;
}

export function generateRandomID (len = 10) {
  const hex = "0123456789";
  let output = "";
  for (let i = 0; i < len; ++i) {
    output += hex.charAt(Math.floor(Math.random() * hex.length));
  }
  return output;
}

export function random (min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
