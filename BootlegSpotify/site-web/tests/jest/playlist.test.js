import { jest } from "@jest/globals";
import { SHORTCUTS, SKIP_TIME } from "../../src/assets/js/consts";
import HTTPManager from "../../src/assets/js/http_manager";
import Player from "../../src/assets/js/player";
import PlayListManager from "../../src/assets/js/playlist";

describe("Playlist tests", () => {
  const assignMock = jest.fn();
  const clearHTML = () => (document.body.innerHTML = "");
  let playListManager;

  const setUpHTML = () => {
    const playListImg = document.createElement("img");
    playListImg.setAttribute("id", "playlist-img");
    playListImg.setAttribute("src", "");
    document.body.appendChild(playListImg);

    const playListTitle = document.createElement("h2");
    playListTitle.setAttribute("id", "playlist-title");
    playListTitle.setAttribute("textContent", "");
    document.body.appendChild(playListTitle);

    const songContainer = document.createElement("div");
    songContainer.setAttribute("id", "song-container");
    document.body.appendChild(songContainer);

    const songItem = document.createElement("div");
    songItem.setAttribute("id", "song-item");
    document.body.appendChild(songItem);

    const nowPlaying = document.createElement("div");
    nowPlaying.setAttribute("id", "now-playing");
    nowPlaying.setAttribute("textContent", "");
    document.body.appendChild(nowPlaying);

    const playButton = document.createElement("button");
    playButton.setAttribute("id", "play");
    playButton.setAttribute("classList", "");
    document.body.appendChild(playButton);

    const shuffleButton = document.createElement("button");
    shuffleButton.setAttribute("id", "shuffle");
    shuffleButton.setAttribute("classList", "");
    document.body.appendChild(shuffleButton);

    const muteButton = document.createElement("button");
    muteButton.setAttribute("id", "mute");
    muteButton.setAttribute("classList", "");
    document.body.appendChild(muteButton);

    const previous = document.createElement("button");
    previous.setAttribute("id", "previous");
    document.body.appendChild(previous);

    const next = document.createElement("button");
    next.setAttribute("id", "next");
    document.body.appendChild(next);

    const timelineCurrent = document.createElement("span");
    timelineCurrent.setAttribute("id", "timeline-current");
    document.body.appendChild(timelineCurrent);

    const timelineEnd = document.createElement("span");
    timelineEnd.setAttribute("id", "timeline-end");
    document.body.appendChild(timelineEnd);

    const timeline = document.createElement("input");
    timeline.setAttribute("id", "timeline");
    document.body.appendChild(timeline);

    const audio = document.createElement("audio");
    audio.setAttribute("id", "audio");
    document.body.appendChild(audio);

    const playlistEdit = document.createElement("button");
    playlistEdit.setAttribute("id", "playlist-edit");
    document.body.appendChild(playlistEdit);
  };

  beforeEach(() => {
    delete window.location;
    setUpHTML();
    playListManager = new PlayListManager(new Player(), new HTTPManager());
    jest.spyOn(playListManager.HTTPManager, "getPlaylistById").mockImplementation(async () => {});
    jest.spyOn(playListManager.HTTPManager, "fetchSong").mockImplementation(async () => []);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    assignMock.mockClear();
    clearHTML();
  });

  it("loadSongs should buildSongItem, and call StorageManager {getPlaylistById} & Player.loadSongs for a valid playlist", async () => {
    const songs = [{ id: 0 }, { id: 1 }];
    const playList = { songs, thumbnail: "", name: "" };
    const buildSongItemSpy = jest
      .spyOn(playListManager, "buildSongItem")
      .mockImplementation(() => document.getElementById("song-item"));
    const httpSpy = jest.spyOn(playListManager.HTTPManager, "getPlaylistById").mockImplementation(async () => playList);
    const playerLoadSongsSpy = jest.spyOn(playListManager.player, "loadSongs").mockImplementation(() => {});
    const playlistId = null;
    await playListManager.loadSongs(playlistId);
    expect(httpSpy).toBeCalled();
    expect(playerLoadSongsSpy).toBeCalled();
    expect(buildSongItemSpy).toBeCalled();
  });

  it("buildSongItem should build song's item while calling playAudio & setCurrentSongName upon click", () => {
    const song = { name: "Whip", genre: "Electronic", artist: "prazkhanal", liked: true };
    const index = 0;
    const playAudioSpy = jest.spyOn(playListManager, "playAudio").mockImplementation(() => {});
    const setCurrentSongNameSpy = jest.spyOn(playListManager, "setCurrentSongName").mockImplementation(() => {});
    const expectedHtml = `<div class="song-item flex-row"><span>1</span><p>${song.name}</p><p>${song.genre}</p><p>${song.artist}</p><i class="fa fa-2x fa-heart"></i></div>`;
    const result = playListManager.buildSongItem(song, index);
    expect(result.outerHTML).toEqual(expectedHtml);
    result.dispatchEvent(new Event("click"));
    expect(playAudioSpy).toBeCalled();
    expect(playAudioSpy).toHaveBeenCalledWith(index);
    expect(setCurrentSongNameSpy).toBeCalled();
  });

  it("buildSongItem should build different heart icons", () => {
    const firstSong = { name: "", genre: "", artist: "", liked: true };
    const secondSong = { name: "", genre: "", artist: "", liked: false };
    const index = 0;
    expect(playListManager.buildSongItem(firstSong, index).outerHTML).not.toEqual(
      playListManager.buildSongItem(secondSong, index).outerHTML
    );
  });

  it("playAudio should call setCurrentSongName & Player.playAudio", async () => {
    const setCurrentSongNameSpy = jest.spyOn(playListManager, "setCurrentSongName").mockImplementation(() => {});
    const playerPlayAudioSpy = jest.spyOn(playListManager.player, "playAudio").mockImplementation(() => {});
    const index = -1;
    await playListManager.playAudio(index);
    expect(setCurrentSongNameSpy).toBeCalled();
    expect(playerPlayAudioSpy).toBeCalled();
    expect(playerPlayAudioSpy).toHaveBeenCalledWith(index);
  });

  it("playAudio should correctly add class lists if audio is paused", async () => {
    jest.spyOn(playListManager, "setCurrentSongName").mockImplementation(() => {});
    jest.spyOn(playListManager.player, "playAudio").mockImplementation(() => {});
    document.getElementById("play").classList.add("fa-pause");
    jest.spyOn(playListManager.player.audio, "paused", "get").mockReturnValue(true);
    await playListManager.playAudio(null);
    expect(document.getElementById("play").classList.length).toEqual(1);
    expect(document.getElementById("play").classList[0]).toEqual("fa-play");
  });

  it("playAudio should correctly add class lists if audio is not paused", async () => {
    jest.spyOn(playListManager, "setCurrentSongName").mockImplementation(() => {});
    jest.spyOn(playListManager.player, "playAudio").mockImplementation(() => {});
    document.getElementById("play").classList.add("fa-play");
    jest.spyOn(playListManager.player.audio, "paused", "get").mockReturnValue(false);
    await playListManager.playAudio(null);
    expect(document.getElementById("play").classList.length).toEqual(1);
    expect(document.getElementById("play").classList[0]).toEqual("fa-pause");
  });

  it("playPreviousSong should call setCurrentSongName & Player.playPreviousSong", () => {
    const setCurrentSongNameSpy = jest.spyOn(playListManager, "setCurrentSongName").mockImplementation(() => {});
    const playSpy = jest.spyOn(playListManager.player, "playPreviousSong").mockImplementation(() => {});
    playListManager.playPreviousSong();
    expect(setCurrentSongNameSpy).toBeCalled();
    expect(playSpy).toBeCalled();
  });

  it("playNextSong should call setCurrentSongName & Player.playNextSong", () => {
    const setCurrentSongNameSpy = jest.spyOn(playListManager, "setCurrentSongName").mockImplementation(() => {});
    const playerPlayNextSongSpy = jest.spyOn(playListManager.player, "playNextSong").mockImplementation(() => {});
    playListManager.playNextSong();
    expect(setCurrentSongNameSpy).toBeCalled();
    expect(playerPlayNextSongSpy).toBeCalled();
  });

  it("setCurrentSongName should set song name to #now-playing element", () => {
    const currentSongNameElementId = "now-playing";
    const currentSongNamePlaying = "L'Assasymphonie";
    jest.spyOn(playListManager.player, "currentSong", "get").mockReturnValue({ name: currentSongNamePlaying });
    expect(document.getElementById(currentSongNameElementId).textContent).toEqual("");
    playListManager.setCurrentSongName();
    const expectedTextContent = `On joue : ${currentSongNamePlaying}`;
    expect(document.getElementById(currentSongNameElementId).textContent).toEqual(expectedTextContent);
  });

  it("timelineUpdate should correctly update timeline", () => {
    const currentTime = 50;
    const duration = currentTime * 3;
    jest.spyOn(playListManager.player.audio, "currentTime", "get").mockReturnValue(currentTime);
    jest.spyOn(playListManager.player.audio, "duration", "get").mockReturnValue(duration);
    playListManager.timelineUpdate(
      document.getElementById("timeline-current"),
      { value: 0 },
      document.getElementById("timeline-end")
    );
    expect(document.getElementById("timeline-current").textContent).toEqual("00:50");
    expect(document.getElementById("timeline-end").textContent).toEqual("02:30");
  });

  it("audioSeek should call Player.audioSeek", () => {
    const timelineElement = { value: 10 };
    const playerAudioSeekSpy = jest.spyOn(playListManager.player, "audioSeek").mockImplementation(() => {});
    playListManager.audioSeek(timelineElement);
    expect(playerAudioSeekSpy).toBeCalled();
    expect(playerAudioSeekSpy).toHaveBeenCalledWith(timelineElement.value);
  });

  it("muteToggle should call Player.muteToggle", () => {
    const playerMuteToggleSpy = jest.spyOn(playListManager.player, "muteToggle").mockImplementation(() => {});
    playListManager.muteToggle();
    expect(playerMuteToggleSpy).toBeCalled();
  });

  it("muteToggle should correctly add class lists if player is muted", () => {
    document.getElementById("mute").classList.add("fa-volume-mute");
    jest.spyOn(playListManager.player, "muteToggle").mockImplementation(() => true);
    playListManager.muteToggle();
    expect(document.getElementById("mute").classList.length).toEqual(1);
    expect(document.getElementById("mute").classList[0]).toEqual("fa-volume-high");
  });

  it("muteToggle should correctly add class lists if player is not muted", () => {
    document.getElementById("mute").classList.add("fa-volume-high");
    jest.spyOn(playListManager.player, "muteToggle").mockImplementation(() => false);
    playListManager.muteToggle();
    expect(document.getElementById("mute").classList.length).toEqual(1);
    expect(document.getElementById("mute").classList[0]).toEqual("fa-volume-mute");
  });

  it("shuffleToggle should call Player.shuffleToggle", () => {
    const playerShuffleToggleSpy = jest.spyOn(playListManager.player, "shuffleToggle").mockImplementation(() => true);
    playListManager.shuffleToggle(document.getElementById("shuffle"));
    expect(playerShuffleToggleSpy).toBeCalled();
  });

  it("shuffleToggle should correctly add class lists if shuffled", () => {
    jest.spyOn(playListManager.player, "shuffleToggle").mockImplementation(() => true);
    playListManager.shuffleToggle(document.getElementById("shuffle"));
    expect(document.getElementById("shuffle").classList.length).toEqual(1);
    expect(document.getElementById("shuffle").classList[0]).toEqual("control-btn-toggled");
  });

  it("shuffleToggle should correctly add class lists if not shuffled", () => {
    jest.spyOn(playListManager.player, "shuffleToggle").mockImplementation(() => false);
    document.getElementById("shuffle").classList.add("control-btn-toggled");
    playListManager.shuffleToggle(document.getElementById("shuffle"));
    expect(document.getElementById("shuffle").classList.length).toEqual(0);
  });

  it("scrubTime should call Player.scrubTime", () => {
    const delta = 10;
    const playerScrubTimeSpy = jest.spyOn(playListManager.player, "scrubTime").mockImplementation(() => {});
    playListManager.scrubTime(delta);
    expect(playerScrubTimeSpy).toBeCalled();
    expect(playerScrubTimeSpy).toHaveBeenCalledWith(delta);
  });

  it("bindEvents should correctly add event listeners to Player.audio", () => {
    playListManager.player.audio = document.getElementById("audio");
    playListManager.bindEvents();
    const timelineUpdateSpy = jest.spyOn(playListManager, "timelineUpdate").mockImplementation(() => {});
    document.getElementById("audio").dispatchEvent(new Event("timeupdate"));
    expect(timelineUpdateSpy).toBeCalled();
    expect(timelineUpdateSpy).toHaveBeenCalledWith(
      document.getElementById("timeline-current"),
      document.getElementById("timeline"),
      document.getElementById("timeline-end")
    );
    const playNextSongSpy = jest.spyOn(playListManager, "playNextSong").mockImplementation(() => {});
    document.getElementById("audio").dispatchEvent(new Event("ended"));
    expect(playNextSongSpy).toBeCalled();
  });

  it("bindEvents should correctly add event listener to timeline", () => {
    playListManager.bindEvents();
    const audioSeekSpy = jest.spyOn(playListManager, "audioSeek").mockImplementation(() => {});
    document.getElementById("timeline").dispatchEvent(new Event("input"));
    expect(audioSeekSpy).toBeCalled();
  });

  it("bindEvents should correctly add event listener to play button", () => {
    playListManager.bindEvents();
    const playAudioSpy = jest.spyOn(playListManager, "playAudio").mockImplementation(() => {});
    document.getElementById("play").dispatchEvent(new Event("click"));
    expect(playAudioSpy).toBeCalled();
  });

  it("bindEvents should correctly add event listener to mute button", () => {
    playListManager.bindEvents();
    const muteToggleSpy = jest.spyOn(playListManager, "muteToggle").mockImplementation(() => {});
    document.getElementById("mute").dispatchEvent(new Event("click"));
    expect(muteToggleSpy).toBeCalled();
  });

  it("bindEvents should correctly add event listener to previous button", () => {
    playListManager.bindEvents();
    const playPreviousSongSpy = jest.spyOn(playListManager, "playPreviousSong").mockImplementation(() => {});
    document.getElementById("previous").dispatchEvent(new Event("click"));
    expect(playPreviousSongSpy).toBeCalled();
  });

  it("bindEvents should correctly add event listener to next button", () => {
    playListManager.bindEvents();
    const playNextSongSpy = jest.spyOn(playListManager, "playNextSong").mockImplementation(() => {});
    document.getElementById("next").dispatchEvent(new Event("click"));
    expect(playNextSongSpy).toBeCalled();
  });

  it("bindEvents should correctly add event listener to shuffle button", () => {
    playListManager.bindEvents();
    const shuffleToggleSpy = jest.spyOn(playListManager, "shuffleToggle").mockImplementation(() => {});
    document.getElementById("shuffle").dispatchEvent(new Event("click"));
    expect(shuffleToggleSpy).toBeCalled();
  });

  it("bindShortcuts should correctly bind shortcuts", () => {
    playListManager.bindShortcuts();
    const expectedLength = 6;
    expect(playListManager.shortcuts.size).toEqual(expectedLength);
    expect(playListManager.shortcuts.get(SHORTCUTS.GO_FORWARD)).not.toEqual(undefined);
    expect(playListManager.shortcuts.get(SHORTCUTS.GO_BACK)).not.toEqual(undefined);
    expect(playListManager.shortcuts.get(SHORTCUTS.PLAY_PAUSE)).not.toEqual(undefined);
    expect(playListManager.shortcuts.get(SHORTCUTS.NEXT_SONG)).not.toEqual(undefined);
    expect(playListManager.shortcuts.get(SHORTCUTS.PREVIOUS_SONG)).not.toEqual(undefined);
    expect(playListManager.shortcuts.get(SHORTCUTS.MUTE)).not.toEqual(undefined);
    const scrubTimeSpy = jest.spyOn(playListManager, "scrubTime").mockImplementation(() => {});
    playListManager.shortcuts.get(SHORTCUTS.GO_FORWARD)();
    expect(scrubTimeSpy).toHaveBeenCalledWith(SKIP_TIME);
    playListManager.shortcuts.get(SHORTCUTS.GO_BACK)();
    expect(scrubTimeSpy).toHaveBeenCalledWith(-SKIP_TIME);
    const playAudioSpy = jest.spyOn(playListManager, "playAudio").mockImplementation(() => {});
    playListManager.shortcuts.get(SHORTCUTS.PLAY_PAUSE)();
    expect(playAudioSpy).toBeCalled();
    const playNextSongSpy = jest.spyOn(playListManager, "playNextSong").mockImplementation(() => {});
    playListManager.shortcuts.get(SHORTCUTS.NEXT_SONG)();
    expect(playNextSongSpy).toBeCalled();
    const playPreviousSongSpy = jest.spyOn(playListManager, "playPreviousSong").mockImplementation(() => {});
    playListManager.shortcuts.get(SHORTCUTS.PREVIOUS_SONG)();
    expect(playPreviousSongSpy).toBeCalled();
    const muteToggleSpy = jest.spyOn(playListManager, "muteToggle").mockImplementation(() => {});
    playListManager.shortcuts.get(SHORTCUTS.MUTE)();
    expect(muteToggleSpy).toBeCalled();
    expect(scrubTimeSpy).toHaveBeenCalledTimes(2);
    expect(playAudioSpy).toHaveBeenCalledTimes(1);
    expect(playNextSongSpy).toHaveBeenCalledTimes(1);
    expect(playPreviousSongSpy).toHaveBeenCalledTimes(1);
    expect(muteToggleSpy).toHaveBeenCalledTimes(1);
  });

  it("bindShortcuts should correctly add keydown event listener", () => {
    const key = SHORTCUTS.MUTE;
    const muteToggleSpy = jest.spyOn(playListManager, "muteToggle").mockImplementation(() => {});
    playListManager.shortcuts.set(key, () => playListManager.muteToggle());
    playListManager.bindShortcuts();
    const keydownEvent = new Event("keydown");
    keydownEvent.key = key;
    document.dispatchEvent(keydownEvent);
    expect(muteToggleSpy).toBeCalled();
  });

  it("bindEvents should correctly add event listener to playlist edit button", () => {
    playListManager.bindEvents();
    window.location = { href: "test_value" };
    const event = new Event("click");
    document.getElementById("playlist-edit").dispatchEvent(event);
    expect(window.location.href).not.toEqual("test_value");
  });

  it("load should correctly call bindEvents, bindShortcuts, laodSongs & StorageManger.loadAllData", () => {
    const bindEventsSpy = jest.spyOn(playListManager, "bindEvents").mockImplementation(() => {});
    const bindShortcutsSpy = jest.spyOn(playListManager, "bindShortcuts").mockImplementation(() => {});
    const loadSongsSpy = jest.spyOn(playListManager, "loadSongs").mockImplementation(() => {});
    playListManager.load();
    expect(bindEventsSpy).toBeCalled();
    expect(bindShortcutsSpy).toBeCalled();
    expect(loadSongsSpy).toBeCalled();
  });
});
