const fs = require("fs");

class FileSystemManager {
  /**
   * Écrit les données dans un fichier
   * @param {string} path : le chemin qui correspond au fichier JSON
   * @param {string} data : l'information à sauvegarder en string
   * @returns {Promise<void>} aucune valeur retournée
   */
  async writeToJsonFile (path, data) {
    return await fs.promises.writeFile(path, data);
  }

  /**
   * Lit et retourne le contenu d'un fichier
   * @param {string} path : le chemin qui correspond au fichier JSON
   * @returns {Promise<Buffer>} le cotenu du fichier sous la forme de Buffer
   */
  async readFile (path) {
    return await fs.promises.readFile(path);
  }
}

module.exports = { FileSystemManager };
