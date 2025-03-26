import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

// Ensure to call this before importing any other modules!

// move this data source name to .env file
Sentry.init({
  //dsn:"https://d7452b6c86e81ebb5746d73b0233dbd4@o4508839985086464.ingest.us.sentry.io/4508850576556032",

  dsn: "https://7577fa328334ae33de7f56c949d8979f@o4508852005896192.ingest.us.sentry.io/4508852025425920",

  integrations: [
    // Add our Profiling integration
    nodeProfilingIntegration(),
  ],

  // Add Tracing by setting tracesSampleRate
  // We recommend adjusting this value in production

  tracesSampleRate: 1.0, // capture 100% of transactions for performance monitoring

  // Set sampling rate for profiling
  // This is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});

Sentry.profiler.startProfiler();

Sentry.startSpan(
  {
    name: "My First Transaction",
  },
  () => {
    // Any code in this callback will be profiled.
  }
);

Sentry.profiler.stopProfiler();

export default Sentry;
