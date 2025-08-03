# Generation Failed

Error: Command failed: node src/cli.js ai generate single-page --input "examples/ekg-cv-showcase/Dawn_Zurick_Beilfuss_EKG_CV_2025.md" --output "ab-test-results/gpt4o_creative_output.md" --config "ab-test-results/gpt4o_creative_config.json"
node:internal/modules/cjs/loader:1368
  throw err;
  ^

Error: Cannot find module '/Users/scottybe/Development/tools/Workspace/dzb-cv/src/cli.js'
    at Function._resolveFilename (node:internal/modules/cjs/loader:1365:15)
    at defaultResolveImpl (node:internal/modules/cjs/loader:1021:19)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1026:22)
    at Function._load (node:internal/modules/cjs/loader:1175:37)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:235:24)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:171:5)
    at node:internal/main/run_main_module:36:49 {
  code: 'MODULE_NOT_FOUND',
  requireStack: []
}

Node.js v22.18.0


Configuration: GPT-4o Creative