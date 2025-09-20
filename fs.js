// fs.js - Simple in-memory file system
(function() {
  const fsData = { "/": {} };

  function normalize(path) {
    return path.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
  }

  function resolveParts(path) {
    return normalize(path).split("/").filter(Boolean);
  }

  function getParent(path) {
    const parts = resolveParts(path);
    parts.pop();
    return "/" + parts.join("/");
  }

  window.fs = {
    normalize,

    getNode(path) {
      const parts = resolveParts(path);
      let node = fsData["/"];
      for (const part of parts) {
        if (typeof node !== "object" || !(part in node)) return null;
        node = node[part];
      }
      return node;
    },

    setNode(path, value) {
      const parts = resolveParts(path);
      let node = fsData["/"];
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!(part in node)) node[part] = {};
        node = node[part];
      }
      node[parts[parts.length - 1]] = value;
    },

    exists(path) {
      return this.getNode(path) !== null;
    },

    rm(path) {
      const parts = resolveParts(path);
      const parent = this.getNode("/" + parts.slice(0, -1).join("/"));
      if (parent && typeof parent === "object") {
        delete parent[parts[parts.length - 1]];
      }
    },

    ls(path) {
      const node = this.getNode(path);
      if (typeof node !== "object") return [];
      return Object.keys(node);
    }
  };
})();
