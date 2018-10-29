#!/usr/bin/env node

const chalk = require("chalk");

module.exports = {
  out (message) {
    console.log(chalk.white('  ' + message))
  },
  debug (message) {
    console.log(chalk.gray.italic('debug: ' + message))
  },
  sys (message) {
    console.log(chalk.white('🤖 ' + message))
  },
  good (message) {
    console.log(chalk.green('✅ ' + message))
  },
  warn (message) {
    console.log(chalk.yellow('⚠️ ' + message))
  },
  err (message) {
    console.log(chalk.red('❗ ' + message))
  }
}