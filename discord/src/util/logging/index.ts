/* eslint-disable no-console -- handles logging */

import { Timer } from './timer';

/**
 * Logs passed arguments (the message) under a given category.
 * @param category - The category to log under.
 * @param args - The arguments to log.
 */
export function log(category: string, ...args: unknown[]): void {
  console.log(getMessageStart(category, new Error().stack), ...args);
}

/**
 * Starts a timer.
 * @param timer - The timer type to start.
 */
export function timerStart(timer: Timer | string): void {
  console.time(getMessageStart(fullTimerName(timer), new Error().stack));
}

/**
 * Ends a timer, logging the result.
 * @param timer - The timer type to end.
 */
export function timerEnd(timer: Timer | string): void {
  console.timeEnd(getMessageStart(fullTimerName(timer), new Error().stack));
}

function fullTimerName(timer: Timer | string): string {
  return `timer > ${timerName(timer)}`;
}

function timerName(timer: Timer | string): string {
  if (typeof timer === 'string') {
    return timer;
  }

  switch (timer) {
    case Timer.Initialization:
      return 'Initialization';
  }
}

function getMessageStart(category: string, stack: string | undefined): string {
  let fullCat = category;
  if (category !== '') {
    fullCat = ` > ${category}`;
  }

  const fullMessage = `[\x1b[38;2;88;101;242mcaesar\x1b[0m${fullCat}]`;
  if (!stack) {
    return fullMessage;
  }

  // TODO: Refine logging and process stack later.
  return fullMessage;

  /*const caller = processStack(stack);
  if (!caller) {
    return fullMessage;
  }

  return `(${caller}) ${fullMessage}`;*/
}

/*function processStack(stack: string): string | undefined void {
  const stackLines = stack.split('\n');
  const callerLine = stackLines[2];
  const callerLineParts = /\((?<a>.*):(?<b>\d+):(?<c>\d+)\)$/.exec(callerLine);

  if (!callerLineParts) {
    return undefined;
  }

  let filePath = callerLineParts.groups?.a ?? '<unknown>';
  const lineNumber = callerLineParts.groups?.b ?? '<unknown>';
  // const columnNumber = callerLineParts.groups?.c ?? '<unknown>';

  // remove excess in file path


  return `${filePath}:${lineNumber}`;
}*/
