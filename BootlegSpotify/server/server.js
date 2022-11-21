const path = require("path");
const express = require("express");
const playlistsRouter = require("./routes/playlists");
const songsRouter = require("./routes/songs");
const searchRouter = require("./routes/search_bar");
const cors = require("cors");

const app = express();
const PORT = 5020;
const SIZE_LIMIT = "10mb";
const PUBLIC_PATH = path.join(__dirname);

app.use(cors({ origin: '*' }));

// afficher chaque nouvelle requête dans la console
app.use((request, response, next) => {
  console.log(`New HTTP request: ${request.method} ${request.url}`);
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: SIZE_LIMIT }));
app.use(express.static(PUBLIC_PATH));

// TODO : Rajouter les routeurs sur les bon prefixes
app.use("/api/playlists", playlistsRouter.router);
app.use("/api/songs", songsRouter.router);
app.use("/api/search", searchRouter.router);

const server = app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

module.exports = server;
