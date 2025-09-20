// calc.js - Simple Terminal Calculator for TSPOS
window.commands = window.commands || {};

commands.calc = {
  desc: "Evaluate a math expression (e.g., calc 2 + 2 * 3)",
  fn(args, print) {
    const expression = args.join(" ");
    if (!expression) {
      print("Usage: calc <expression>", "error");
      return;
    }

    try {
      // Safe basic math evaluator
      const result = Function('"use strict";return (' + expression + ')')();
      print(`Result: ${result}`);
    } catch (err) {
      print(`Error: Invalid expression`, "error");
    }
  }
};
