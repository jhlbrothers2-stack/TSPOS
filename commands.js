// commands.js - Core command package for TSPOS Terminal
window.commands = window.commands || {};

commands.help = {
  desc: "Show this help message",
  fn(args, print) {
    let helpText = "Available commands:\n";
    for (const [name, cmd] of Object.entries(window.commands)) {
      helpText += `  ${name.padEnd(12)} - ${cmd.desc || "No description"}\n`;
    }
    print(helpText);
  }
};

commands.echo = {
  desc: "Print text to terminal",
  fn(args, print) {
    print(args.join(" "));
  }
};

commands.clear = {
  desc: "Clear the terminal screen",
  fn(args, print) {
    const terminal = document.getElementById("terminal");
    if (terminal) terminal.innerText = "";
    print("Terminal cleared");
  }
};

commands.ls = {
  desc: "List files in directory",
  fn(args, print, fs) {
    const path = args[0] || "/";
    if (!fs.exists(path)) {
      print(`ls: ${path}: No such file or directory`, "error");
      return;
    }
    const list = fs.ls(path);
    if (!Array.isArray(list)) {
      print(`ls: ${path}: Not a directory`, "error");
      return;
    }
    print(list.join("  "));
  }
};

commands.cat = {
  desc: "Show file contents",
  fn(args, print, fs) {
    const path = args[0];
    if (!path) {
      print("cat: missing file operand", "error");
      return;
    }
    if (!fs.exists(path)) {
      print(`cat: ${path}: No such file or directory`, "error");
      return;
    }
    const node = fs.getNode(path);
    if (typeof node === "object") {
      print(`cat: ${path}: Is a directory`, "error");
      return;
    }
    print(node);
  }
};

commands.touch = {
  desc: "Create empty file or update timestamp",
  fn(args, print, fs) {
    const path = args[0];
    if (!path) {
      print("touch: missing file operand", "error");
      return;
    }
    const exists = fs.exists(path);
    if (exists) {
      // Update the file content unchanged
      const content = fs.getNode(path);
      fs.setNode(path, content);
      print(`Updated timestamp for '${path}'`);
    } else {
      // Create empty file
      fs.setNode(path, "");
      print(`Created file '${path}'`);
    }
  }
};

commands.mkdir = {
  desc: "Create a new directory",
  fn(args, print, fs) {
    const path = args[0];
    if (!path) {
      print("mkdir: missing directory name", "error");
      return;
    }
    if (fs.exists(path)) {
      print(`mkdir: ${path}: File exists`, "error");
      return;
    }
    if (fs.mkdir(path)) {
      print(`Created directory '${path}'`);
    } else {
      print(`mkdir: failed to create '${path}'`, "error");
    }
  }
};

commands.rm = {
  desc: "Remove file or empty directory",
  fn(args, print, fs) {
    const path = args[0];
    if (!path) {
      print("rm: missing operand", "error");
      return;
    }
    if (!fs.exists(path)) {
      print(`rm: cannot remove '${path}': No such file or directory`, "error");
      return;
    }
    try {
      fs.rm(path);
      print(`Removed '${path}'`);
    } catch (err) {
      print(`rm: failed to remove '${path}': ${err.message}`, "error");
    }
  }
};

commands.pwd = {
  desc: "Print working directory",
  fn(args, print) {
    print("/home/user");
  }
};

commands.whoami = {
  desc: "Show current user",
  fn(args, print) {
    print("user");
  }
};

commands.date = {
  desc: "Show current date and time",
  fn(args, print) {
    print(new Date().toString());
  }
};

commands.exit = {
  desc: "Reload the shell",
  fn() {
    location.reload();
  }
};