// mini.js - Mini text editor package for TSPOS Terminal
window.commands = window.commands || {};

commands.mini = {
  desc: "Mini text editor with file editing capabilities",
  fn(args, print, fs) {
    if (args.length === 0) {
      print("Usage: mini filename", "error");
      return;
    }
    
    const filename = args[0];
    const content = fs.exists(filename) ? fs.getNode(filename) : "";
    
    // Create editor UI
    const editorHTML = `
      <div id="mini-editor" style="
        position: fixed; top: 50px; left: 50px; 
        width: 600px; height: 400px; 
        background: #1e1e1e; border: 2px solid #333; 
        border-radius: 5px; z-index: 1000; 
        display: flex; flex-direction: column;
        box-shadow: 0 5px 15px rgba(0,0,0,0.5);
      ">
        <div style="
          background: #252526; padding: 8px 12px; 
          display: flex; justify-content: space-between;
          border-bottom: 1px solid #333;
        ">
          <div style="font-weight: bold;">Editing: ${filename}</div>
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
      </div>
    `;
    
    // Add editor to page
    const editorEl = document.createElement('div');
    editorEl.innerHTML = editorHTML;
    document.body.appendChild(editorEl);
    
    // Focus textarea
    const textarea = document.getElementById('mini-textarea');
    textarea.focus();
    
    // Set up event listeners
    document.getElementById('mini-save').addEventListener('click', () => {
      fs.setNode(filename, textarea.value);
      print(`Saved changes to ${filename}`, "success");
      document.body.removeChild(editorEl);
    });
    
    document.getElementById('mini-close').addEventListener('click', () => {
      document.body.removeChild(editorEl);
    });
    
    // Close on Escape key
    document.addEventListener('keydown', function closeOnEscape(e) {
      if (e.key === 'Escape') {
        document.body.removeChild(editorEl);
        document.removeEventListener('keydown', closeOnEscape);
      }
    });
  }
};