// gui.js — TSPOS GUI package (with resize + maximize animations)

if (!window.commands) window.commands = {};
if (!window.htmlFiles) window.htmlFiles = {};

// GUI command
window.commands.gui = {
  desc: "GUI tools. Usage: gui run <file.html> | gui list",
  fn: (args, print) => {
    if (!args || args.length === 0) {
      print("Usage: gui <command>");
      return;
    }

    const sub = args[0];
    if (sub === "run") {
      const filename = args[1];
      if (!filename) {
        print("Usage: gui run <filename.html>");
        return;
      }
      const html = window.htmlFiles[filename];
      if (!html) {
        print(`HTML file not found: ${filename}`, "error");
        return;
      }
      openGuiWindow(filename, html, print);
    } else if (sub === "list") {
      const files = Object.keys(window.htmlFiles);
      if (!files.length) {
        print("No HTML files loaded.");
        return;
      }
      print("Available HTML files:\n" + files.join("\n"));
    } else {
      print(`Unknown gui command: ${sub}`);
    }
  }
};

// Function to open a draggable, resizable window with maximize support
function openGuiWindow(filename, html, print) {
  const win = document.createElement("div");
  win.className = "gui-window";
  Object.assign(win.style, {
    position: "fixed",
    top: "100px",
    left: "100px",
    width: "600px",
    height: "400px",
    border: "1px solid #ccc",
    background: "#fff",
    boxShadow: "0 0 12px rgba(0,0,0,0.5)",
    zIndex: 10000,
    overflow: "hidden",
    borderRadius: "6px",
    transition: "all 0.3s ease" // animation
  });

  // --- Titlebar ---
  const bar = document.createElement("div");
  Object.assign(bar.style, {
    background: "#444",
    color: "#fff",
    padding: "6px 12px",
    fontWeight: "bold",
    cursor: "move",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  });
  bar.innerText = filename;

  // Close button
  const close = document.createElement("button");
  close.innerText = "×";
  Object.assign(close.style, {
    background: "red",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    marginLeft: "8px"
  });
  close.onclick = () => win.remove();

  // Maximize button
  const maxBtn = document.createElement("button");
  maxBtn.innerText = "⬜";
  Object.assign(maxBtn.style, {
    background: "#555",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    marginLeft: "auto",
    marginRight: "4px"
  });

  // Track maximize state
  let maximized = false;
  let prevRect = null;

  maxBtn.onclick = () => {
    if (!maximized) {
      // Save current position/size
      prevRect = {
        top: win.offsetTop,
        left: win.offsetLeft,
        width: win.offsetWidth,
        height: win.offsetHeight
      };
      // Animate to full screen
      win.style.top = "0px";
      win.style.left = "0px";
      win.style.width = window.innerWidth + "px";
      win.style.height = window.innerHeight + "px";
      maximized = true;
    } else {
      // Restore with animation
      win.style.top = prevRect.top + "px";
      win.style.left = prevRect.left + "px";
      win.style.width = prevRect.width + "px";
      win.style.height = prevRect.height + "px";
      maximized = false;
    }
  };

  bar.appendChild(maxBtn);
  bar.appendChild(close);
  win.appendChild(bar);

  // --- Content ---
  const iframe = document.createElement("iframe");
  Object.assign(iframe.style, {
    width: "100%",
    height: "calc(100% - 30px)",
    border: "none"
  });
  iframe.srcdoc = html;

  win.appendChild(iframe);
  document.body.appendChild(win);

  // --- Dragging logic ---
  let dragging = false, offsetX, offsetY;
  bar.addEventListener("mousedown", e => {
    if (maximized) return; // don't drag when maximized
    dragging = true;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
    document.body.style.userSelect = "none";
  });
  document.addEventListener("mousemove", e => {
    if (!dragging) return;
    win.style.left = e.clientX - offsetX + "px";
    win.style.top = e.clientY - offsetY + "px";
  });
  document.addEventListener("mouseup", () => {
    dragging = false;
    document.body.style.userSelect = "";
  });

  // --- Resizing logic ---
  win.style.resize = "both";
  win.style.overflow = "auto";

  print(`GUI opened: ${filename}`, "success");
}

// --- Drag & Drop support ---
document.addEventListener("dragover", e => e.preventDefault());
document.addEventListener("drop", e => {
  e.preventDefault();
  if (!e.dataTransfer.files.length) return;

  for (const file of e.dataTransfer.files) {
    if (file.name.endsWith(".html")) {
      const reader = new FileReader();
      reader.onload = () => {
        window.htmlFiles[file.name] = reader.result;
        console.log("Loaded HTML file:", file.name);
        if (window.print) window.print(`Loaded HTML file: ${file.name}`);
      };
      reader.readAsText(file);
    } else {
      if (window.print) window.print(`Unsupported file type: ${file.name}`, "error");
    }
  }
});
