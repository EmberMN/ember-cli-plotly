window.deprecationWorkflow = window.deprecationWorkflow || {};
window.deprecationWorkflow.config = {
  workflow: [
    { handler: "silence", matchId: "deprecate-router-events" } // See https://github.com/ebryn/ember-component-css/issues/309
  ]
};

