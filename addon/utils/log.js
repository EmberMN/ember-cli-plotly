export function getLoggingFunctions(logNamespace) {
  let log = console.log.bind(console);
  let logVerbose = console.log.bind(console);
  let warn = console.warn.bind(console);
  import('debug')
    .then((d) => {
      const debug = d.default;
      log = debug(logNamespace);
      logVerbose = debug(`${logNamespace}:verbose`);
      warn = debug(logNamespace);
      warn.log = console.warn.bind(console); // eslint-disable-line no-console
    })
    .catch(() => {
      // if debug isn't present, suppress all except warnings
      log = (...args) => undefined; // eslint-disable-line no-unused-vars
      logVerbose = log;
    });

  return {
    log,
    logVerbose,
    warn,
  };
}

export default getLoggingFunctions;
