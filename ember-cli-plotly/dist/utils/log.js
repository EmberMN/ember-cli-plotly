import debug from 'debug';

function getLoggingFunctions(logNamespace) {
  const log = debug(logNamespace);
  const logVerbose = debug(`${logNamespace}:verbose`);
  const warn = debug(logNamespace);
  warn.log = console.warn.bind(console); // eslint-disable-line no-console

  return {
    log,
    logVerbose,
    warn
  };
}

export { getLoggingFunctions as default, getLoggingFunctions };
