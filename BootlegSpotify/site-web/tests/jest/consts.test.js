import { SHORTCUTS } from "../../src/assets/js/consts";
import { jest } from "@jest/globals";

describe("Consts tests", () => {
  const assignMock = jest.fn();
  const clearHTML = () => (document.body.innerHTML = "");

  beforeEach(() => {
    delete window.location;
    window.location = { assign: assignMock };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    assignMock.mockClear();
    clearHTML();
  });

  it("Shortcuts should be valid", () => {
    const nextSongChar = 'n';
    const previousSongChar = 'p';
    const muteChar = 'm';
    const playPauseChar = ' ';
    const goBackChar = 'j';
    const goForwardChar = 'l';
    const volumeUpStr = 'ArrowUp';
    const volumeDownStr = 'ArrowDown';
    expect(SHORTCUTS.NEXT_SONG).toEqual(nextSongChar);
    expect(SHORTCUTS.PREVIOUS_SONG).toEqual(previousSongChar);
    expect(SHORTCUTS.MUTE).toEqual(muteChar);
    expect(SHORTCUTS.PLAY_PAUSE).toEqual(playPauseChar);
    expect(SHORTCUTS.GO_BACK).toEqual(goBackChar);
    expect(SHORTCUTS.GO_FORWARD).toEqual(goForwardChar);
    expect(SHORTCUTS.VOLUME_UP).toEqual(volumeUpStr);
    expect(SHORTCUTS.VOLUME_DOWN).toEqual(volumeDownStr);
  });
});
