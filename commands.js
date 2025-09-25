// commands.js — shell + virtual FS commands
if (!window.commands) window.commands = {};

// --- Virtual File System ---
if (!window.fs) {
  window.fs = {
    files: { "/": { type: "dir", children: {} } },
    cwd: "/",

    resolve(path) {
      if (!path) return this.cwd;
      if (path.startsWith("/")) return path;
      return this.cwd.replace(/\/$/, "") + "/" + path;
    },

    getNode(path) {
      const parts = path.split("/").filter(Boolean);
      let node = this.files["/"];
      for (const part of parts) {
        if (!node.children[part]) return null;
        node = node.children[part];
      }
      return node;
    },

    writeFile(path, content = "") {
      path = this.resolve(path);
      const parts = path.split("/").filter(Boolean);
      let node = this.files["/"];
      for (let i = 0; i < parts.length - 1; i++) {
        if (!node.children[parts[i]]) {
          node.children[parts[i]] = { type: "dir", children: {} };
        }
        node = node.children[parts[i]];
      }
      node.children[parts[parts.length - 1]] = {
        type: "file",
        content,
        size: content.length,
        createdAt: new Date().toLocaleString()
      };
    },

    readFile(path) {
      const node = this.getNode(this.resolve(path));
      if (!node || node.type !== "file") throw new Error("No such file: " + path);
      return node.content;
    },

    delete(path) {
      path = this.resolve(path);
      const parts = path.split("/").filter(Boolean);
      let node = this.files["/"];
      for (let i = 0; i < parts.length - 1; i++) {
        node = node.children[parts[i]];
        if (!node) return;
      }
      delete node.children[parts[parts.length - 1]];
    },

    list(path) {
      const node = this.getNode(this.resolve(path || this.cwd));
      if (!node || node.type !== "dir") throw new Error("Not a directory: " + path);
      return Object.keys(node.children);
    },

    mkdir(path) {
      path = this.resolve(path);
      const parts = path.split("/").filter(Boolean);
      let node = this.files["/"];
      for (const part of parts) {
        if (!node.children[part]) {
          node.children[part] = { type: "dir", children: {} };
        }
        node = node.children[part];
      }
    }
  };
}

// --- Helper to register commands ---
function reg(name, fn) {
  window.commands[name] = { fn };
}

// --- Commands ---
reg("help", (args, print) => {
  print("Available commands:");
  print("  mini, help, echo, clear, cd, pwd, ls, cat, touch, mkdir, rm, mv, cp,");
  print("  date, whoami, exit, stat, head, tail, env, history, basename, dirname");
});

reg("echo", (args, print) => print(args.join(" ")));

reg("clear", (args, print) => {
  document.getElementById("output").innerHTML = "";
});

reg("cd", (args, print) => {
  if (!args[0]) return print("Usage: cd <dir>");
  const path = window.fs.resolve(args[0]);
  const node = window.fs.getNode(path);
  if (!node || node.type !== "dir") return print("Not a directory: " + args[0]);
  window.fs.cwd = path;
});

reg("pwd", (args, print) => print(window.fs.cwd));

reg("ls", (args, print) => {
  try {
    window.fs.list(args[0] || window.fs.cwd).forEach(f => print(f));
  } catch (e) {
    print("Error: " + e.message);
  }
});

reg("cat", (args, print) => {
  if (!args[0]) return print("Usage: cat <file>");
  try {
    print(window.fs.readFile(args[0]));
  } catch (e) {
    print("Error: " + e.message);
  }
});

reg("touch", (args, print) => {
  if (!args[0]) return print("Usage: touch <file>");
  window.fs.writeFile(args[0], "");
  print("Created file: " + args[0]);
});

reg("mkdir", (args, print) => {
  if (!args[0]) return print("Usage: mkdir <dir>");
  window.fs.mkdir(args[0]);
  print("Created directory: " + args[0]);
});

reg("rm", (args, print) => {
  if (!args[0]) return print("Usage: rm <file>");
  window.fs.delete(args[0]);
  print("Removed: " + args[0]);
});

reg("mv", (args, print) => {
  if (args.length < 2) return print("Usage: mv <src> <dest>");
  try {
    const content = window.fs.readFile(args[0]);
    window.fs.writeFile(args[1], content);
    window.fs.delete(args[0]);
    print(`Moved ${args[0]} -> ${args[1]}`);
  } catch (e) {
    print("Error: " + e.message);
  }
});

reg("cp", (args, print) => {
  if (args.length < 2) return print("Usage: cp <src> <dest>");
  try {
    const content = window.fs.readFile(args[0]);
    window.fs.writeFile(args[1], content);
    print(`Copied ${args[0]} -> ${args[1]}`);
  } catch (e) {
    print("Error: " + e.message);
  }
});

reg("date", (args, print) => print(new Date().toString()));

reg("whoami", (args, print) => print("guest"));

reg("exit", (args, print) => location.reload());

reg("stat", (args, print) => {
  if (!args[0]) return print("Usage: stat <file>");
  const node = window.fs.getNode(window.fs.resolve(args[0]));
  if (!node) return print("No such file");
  print(JSON.stringify(node, null, 2));
});

reg("head", (args, print) => {
  if (!args[0]) return print("Usage: head <file>");
  try {
    const lines = window.fs.readFile(args[0]).split("\n");
    print(lines.slice(0, 5).join("\n"));
  } catch (e) {
    print("Error: " + e.message);
  }
});

reg("tail", (args, print) => {
  if (!args[0]) return print("Usage: tail <file>");
  try {
    const lines = window.fs.readFile(args[0]).split("\n");
    print(lines.slice(-5).join("\n"));
  } catch (e) {
    print("Error: " + e.message);
  }
});

reg("env", (args, print) => {
  print("USER=guest");
  print("SHELL=web-terminal");
});

reg("history", (args, print) => {
  window.commandHistory.forEach((cmd, i) => print(i + "  " + cmd));
});

reg("basename", (args, print) => {
  if (!args[0]) return print("Usage: basename <path>");
  print(args[0].split("/").pop());
});

reg("dirname", (args, print) => {
  if (!args[0]) return print("Usage: dirname <path>");
  const parts = args[0].split("/");
  parts.pop();
  print(parts.join("/") || "/");
});
