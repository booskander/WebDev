import { formatTime } from "./utils.js";
import { SKIP_TIME, SHORTCUTS, SERVER_URL } from "./consts.js";
import HTTPManager from "./http_manager.js";
import Player from "./player.js";

export default class PlayListManager {
  constructor (player, HTTPManager) {
    this.player = player;
    this.HTTPManager = HTTPManager;
    this.shortcuts = new Map();
  }

  async loadSongs (playlistId) {
    const playlist = await this.HTTPManager.getPlaylistById(playlistId);

    document.getElementById("playlist-img").src = `${SERVER_URL}/${playlist.thumbnail}`;
    document.getElementById("playlist-title").textContent = playlist.name;

    const songsToLoad = await Promise.all(
      playlist.songs.map(async (song) => {
        return await this.HTTPManager.fetchSong(song.id);
      })
    );

    const songContainer = document.getElementById("song-container");
    songContainer.innerHTML = "";
    songsToLoad.forEach((song, index) => {
      const songItem = this.buildSongItem(song, index);
      songContainer.appendChild(songItem);
    });

    this.player.loadSongs(songsToLoad);
  }

  buildSongItem (song, index) {
    const songItem = document.createElement("div");
    songItem.classList.add("song-item", "flex-row");
    songItem.addEventListener("click", () => {
      this.playAudio(index);
      this.setCurrentSongName();
    });

    const songIndex = document.createElement("span");
    songIndex.textContent = index + 1;
    songItem.appendChild(songIndex);

    const songName = document.createElement("p");
    songName.textContent = song.name;
    songItem.appendChild(songName);

    const songGenre = document.createElement("p");
    songGenre.textContent = song.genre;
    songItem.appendChild(songGenre);

    const songArtist = document.createElement("p");
    songArtist.textContent = song.artist;
    songItem.appendChild(songArtist);

    const heartIcon = document.createElement("i");
    songItem.appendChild(heartIcon);
    heartIcon.outerHTML = `<i class="${song.liked ? "fa" : "fa-regular"} fa-2x fa-heart"></i>`;

    return songItem;
  }

  async playAudio (index) {
    const playButton = document.getElementById("play");
    await this.player.playAudio(index);
    this.setCurrentSongName();

    playButton.classList.add(this.player.audio.paused ? "fa-play" : "fa-pause");
    playButton.classList.remove(this.player.audio.paused ? "fa-pause" : "fa-play");
  }

  playPreviousSong () {
    this.player.playPreviousSong();
    this.setCurrentSongName();
  }

  playNextSong () {
    this.player.playNextSong();
    this.setCurrentSongName();
  }

  setCurrentSongName () {
    const nowPlayingElement = document.getElementById("now-playing");
    nowPlayingElement.textContent = `On joue : ${this.player.currentSong.name}`;
  }

  timelineUpdate (currentTimeElement, timelineElement, durationElement) {
    const position = (100 * this.player.audio.currentTime) / this.player.audio.duration;
    timelineElement.value = position;
    currentTimeElement.textContent = formatTime(this.player.audio.currentTime);
    if (!isNaN(this.player.audio.duration)) {
      durationElement.textContent = formatTime(this.player.audio.duration);
    }
  }

  audioSeek (timelineElement) {
    this.player.audioSeek(timelineElement.value);
  }

  muteToggle () {
    const muteElement = document.getElementById("mute");
    const isMuted = this.player.muteToggle();
    muteElement.classList.add(isMuted ? "fa-volume-high" : "fa-volume-mute");
    muteElement.classList.remove(isMuted ? "fa-volume-mute" : "fa-volume-high");
  }

  shuffleToggle (shuffleButton) {
    const shuffle = this.player.shuffleToggle();
    if (shuffle) shuffleButton.classList.add("control-btn-toggled");
    else shuffleButton.classList.remove("control-btn-toggled");
  }

  scrubTime (delta) {
    this.player.scrubTime(delta);
  }

  bindEvents () {
    const currentTime = document.getElementById("timeline-current");
    const timeline = document.getElementById("timeline");
    const duration = document.getElementById("timeline-end");
    this.player.audio.addEventListener("timeupdate", () => {
      this.timelineUpdate(currentTime, timeline, duration);
    });

    timeline.addEventListener("input", () => {
      this.audioSeek(timeline);
    });

    this.player.audio.addEventListener("ended", () => {
      this.playNextSong();
    });

    const playButton = document.getElementById("play");
    playButton.addEventListener("click", () => {
      this.playAudio();
    });

    const muteElement = document.getElementById("mute");
    muteElement.addEventListener("click", () => {
      this.muteToggle();
    });

    const previous = document.getElementById("previous");
    previous.addEventListener("click", () => {
      this.playPreviousSong();
    });

    const next = document.getElementById("next");
    next.addEventListener("click", () => {
      this.playNextSong();
    });

    const shuffleButton = document.getElementById("shuffle");
    shuffleButton.addEventListener("click", () => {
      this.shuffleToggle(shuffleButton);
    });

    const edit = document.getElementById("playlist-edit");
    edit.addEventListener("click", () => {
      const urlParams = new URLSearchParams(document.location.search);
      const playlistId = urlParams.get("id");
      window.location.href = `./create_playlist.html?id=${playlistId}`;
    });
  }

  bindShortcuts () {
    this.shortcuts.set(SHORTCUTS.GO_FORWARD, () => this.scrubTime(SKIP_TIME));
    this.shortcuts.set(SHORTCUTS.GO_BACK, () => this.scrubTime(-SKIP_TIME));
    this.shortcuts.set(SHORTCUTS.PLAY_PAUSE, () => this.playAudio());
    this.shortcuts.set(SHORTCUTS.NEXT_SONG, () => this.playNextSong());
    this.shortcuts.set(SHORTCUTS.PREVIOUS_SONG, () => this.playPreviousSong());
    this.shortcuts.set(SHORTCUTS.MUTE, () => this.muteToggle());

    document.addEventListener("keydown", (event) => {
      if (this.shortcuts.has(event.key)) {
        this.shortcuts.get(event.key)();
      }
    });
  }

  load () {
    const urlParams = new URLSearchParams(document.location.search);
    const playlistId = urlParams.get("id");
    this.bindEvents();
    this.bindShortcuts();
    this.loadSongs(playlistId);
  }
}

window.onload = () => {
  new PlayListManager(new Player(), new HTTPManager()).load();
};
