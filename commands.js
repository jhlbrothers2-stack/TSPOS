// commands.js - Core TSPOS Commands for single-file setup
window.commands = window.commands || {};
window.cwd = "/"; // Global current working directory

function resolvePath(fs, path) {
  if (!path || path === ".") return window.cwd;
  if (path === "..") {
    const parts = window.cwd.split("/").filter(Boolean);
    parts.pop();
    return "/" + parts.join("/");
  }
  if (path.startsWith("/")) return fs.normalize(path);
  return fs.normalize(window.cwd + "/" + path);
}

window.commands.help = {
  desc: "Show this help message",
  fn(args, print) {
    print("Available commands:\n" +
      Object.entries(window.commands)
        .map(([name, cmd]) => `  ${name.padEnd(12)} - ${cmd.desc || "No description"}`)
        .join("\n"));
  }
};

window.commands.echo = {
  desc: "Print text to terminal",
  fn(args, print) {
    print(args.join(" "));
  }
};

window.commands.clear = {
  desc: "Clear the terminal screen",
  fn(args, print) {
    const terminal = document.getElementById("terminal");
    if (terminal) terminal.innerHTML = "";
  }
};

window.commands.cd = {
  desc: "Change directory",
  fn(args, print, fs) {
    const path = resolvePath(fs, args[0] || "/");
    const node = fs.getNode(path);
    if (!node) return print(`cd: ${path}: No such file or directory`);
    if (typeof node !== "object") return print(`cd: ${path}: Not a directory`);
    window.cwd = path;
    print(`Now in ${path}`);
  }
};

window.commands.pwd = {
  desc: "Print working directory",
  fn(args, print) {
    print(window.cwd);
  }
};

window.commands.ls = {
  desc: "List directory contents",
  fn(args, print, fs) {
    const path = resolvePath(fs, args[0] || ".");
    const node = fs.getNode(path);
    if (!node) return print(`ls: ${path}: No such file or directory`);
    if (typeof node !== "object") return print(`ls: ${path}: Not a directory`);
    const list = fs.ls(path);
    print(list.join("  "));
  }
};

window.commands.cat = {
  desc: "Show file contents",
  fn(args, print, fs) {
    const path = resolvePath(fs, args[0]);
    const node = fs.getNode(path);
    if (!node) return print(`cat: ${path}: No such file`);
    if (typeof node === "object") return print(`cat: ${path}: Is a directory`);
    print(node);
  }
};

window.commands.touch = {
  desc: "Create empty file or update timestamp",
  fn(args, print, fs, path) {
    if (!args[0]) {
      print("touch: missing filename", "error");
      return;
    }
    const filePath = path.normalize(args[0]);  // ✅ use `path.normalize`, not `fs.normalize`

    fs.writeFile(filePath, fs.exists(filePath) ? fs.readFile(filePath) : "");
    print(`Touched ${filePath}`, "success");
  }
};

window.commands.mkdir = {
  desc: "Create directory",
  fn(args, print, fs) {
    const path = resolvePath(fs, args[0]);
    if (fs.exists(path)) return print(`mkdir: cannot create '${path}': File exists`);
    fs.setNode(path, {});
    print(`Directory '${path}' created`);
  }
};

window.commands.rm = {
  desc: "Remove file or directory",
  fn(args, print, fs) {
    const path = resolvePath(fs, args[0]);
    if (!fs.exists(path)) return print(`rm: '${path}': No such file or directory`);
    fs.rm(path);
    print(`Removed '${path}'`);
  }
};

window.commands.mv = {
  desc: "Move or rename a file",
  fn(args, print, fs) {
    const [srcArg, destArg] = args;
    const src = resolvePath(fs, srcArg);
    const dest = resolvePath(fs, destArg);
    const node = fs.getNode(src);
    if (!node) return print(`mv: cannot stat '${src}': No such file or directory`);
    fs.setNode(dest, node);
    fs.rm(src);
    print(`Moved '${src}' to '${dest}'`);
  }
};

window.commands.cp = {
  desc: "Copy a file",
  fn(args, print, fs) {
    const [srcArg, destArg] = args;
    const src = resolvePath(fs, srcArg);
    const dest = resolvePath(fs, destArg);
    const node = fs.getNode(src);
    if (typeof node === "object") return print("cp: directories not supported");
    if (!node) return print(`cp: cannot stat '${src}': No such file`);
    fs.setNode(dest, node);
    print(`Copied '${src}' to '${dest}'`);
  }
};

window.commands.date = {
  desc: "Show current date and time",
  fn(args, print) {
    print(new Date().toString());
  }
};

window.commands.whoami = {
  desc: "Print current user",
  fn(args, print) {
    print("user");
  }
};

window.commands.exit = {
  desc: "Reload shell",
  fn() {
    location.reload();
  }
};

window.commands.stat = {
  desc: "Show file info",
  fn(args, print, fs) {
    const path = resolvePath(fs, args[0]);
    if (!fs.exists(path)) return print(`stat: cannot stat '${path}': No such file or directory`);
    const node = fs.getNode(path);
    const type = typeof node === "object" ? "directory" : "file";
    print(`Path: ${path}\nType: ${type}\nSize: ${node.length || Object.keys(node).length}`);
  }
};

window.commands.head = {
  desc: "Show first few lines of file",
  fn(args, print, fs) {
    const path = resolvePath(fs, args[0]);
    const node = fs.getNode(path);
    if (!node || typeof node === "object") return print(`head: ${path}: Invalid file`);
    const lines = node.split("\n").slice(0, 10);
    print(lines.join("\n"));
  }
};

window.commands.tail = {
  desc: "Show last few lines of file",
  fn(args, print, fs) {
    const path = resolvePath(fs, args[0]);
    const node = fs.getNode(path);
    if (!node || typeof node === "object") return print(`tail: ${path}: Invalid file`);
    const lines = node.split("\n").slice(-10);
    print(lines.join("\n"));
  }
};

window.commands.env = {
  desc: "List environment variables",
  fn(args, print) {
    print("USER=user\nSHELL=/bin/tsp\nEDITOR=mini");
  }
};

window.commands.history = {
  desc: "Show command history",
  fn(args, print) {
    if (window.commandHistory) {
      window.commandHistory.forEach((cmd, idx) => print(`${idx + 1}: ${cmd}`));
    } else {
      print("No history found.");
    }
  }
};

window.commands.basename = {
  desc: "Show filename from path",
  fn(args, print) {
    if (!args[0]) return print("basename: missing operand");
    const base = args[0].split("/").pop();
    print(base);
  }
};

window.commands.dirname = {
  desc: "Show directory name from path",
  fn(args, print) {
    if (!args[0]) return print("dirname: missing operand");
    const parts = args[0].split("/");
    parts.pop();
    print(parts.join("/") || "/");
  }
};

window.commands.alias = {
  desc: "Define an alias (simulated)",
  fn(args, print) {
    print("aliasing not supported yet");
  }
};
