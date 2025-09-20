// mini.js - Mini text editor package for TSPOS Terminal (single-file friendly)
window.commands = window.commands || {};

window.commands.mini = {
  desc: "Mini text editor with file editing capabilities",
  fn(args, print, fs) {
    if (args.length === 0) {
      print("Usage: mini filename", "error");
      return;
    }
    
    const filename = args[0];
    const content = fs.exists(filename) ? fs.getNode(filename) : "";
    
    // Create editor container
    const editorEl = document.createElement('div');
    editorEl.id = "mini-editor-container";
    editorEl.style = `
      position: fixed; top: 50px; left: 50px; 
      width: 600px; height: 400px; 
      background: #1e1e1e; border: 2px solid #333; 
      border-radius: 5px; z-index: 1000; 
      display: flex; flex-direction: column;
      box-shadow: 0 5px 15px rgba(0,0,0,0.5);
    `;

    editorEl.innerHTML = `
      <div style="
        background: #252526; padding: 8px 12px; 
        display: flex; justify-content: space-between;
        border-bottom: 1px solid #333;
      ">
        <div style="font-weight: bold; color: white;">Editing: ${filename}</div>
        <div>
          <button id="mini-save" style="
            background: #007acc; color: white; 
            border: none; padding: 4px 10px; 
            border-radius: 3px; margin-right: 5px;
            cursor: pointer;
          ">Save</button>
          <button id="mini-close" style="
            background: #555; color: white; 
            border: none; padding: 4px 10px; 
            border-radius: 3px; cursor: pointer;
          ">Close</button>
        </div>
      </div>
      <textarea id="mini-textarea" style="
        flex: 1; background: #1e1e1e; color: #e0e0e0;
        border: none; padding: 12px; resize: none;
        outline: none; font-family: 'Courier New', monospace;
        font-size: 13px;
      ">${content}</textarea>
    `;

    document.body.appendChild(editorEl);

    // Focus textarea
    const textarea = document.getElementById('mini-textarea');
    textarea.focus();

    // Save handler
    document.getElementById('mini-save').addEventListener('click', () => {
      fs.setNode(filename, textarea.value);
      print(`Saved changes to ${filename}`, "success");
      if (editorEl.parentNode) editorEl.parentNode.removeChild(editorEl);
      document.removeEventListener('keydown', escListener);
    });

    // Close handler
    document.getElementById('mini-close').addEventListener('click', () => {
      if (editorEl.parentNode) editorEl.parentNode.removeChild(editorEl);
      document.removeEventListener('keydown', escListener);
    });

    // Close on Escape key
    function escListener(e) {
      if (e.key === 'Escape') {
        if (editorEl.parentNode) editorEl.parentNode.removeChild(editorEl);
        document.removeEventListener('keydown', escListener);
      }
    }
    document.addEventListener('keydown', escListener);
  }
};
