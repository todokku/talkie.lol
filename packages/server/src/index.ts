import "./env";

import { WebRtcExperimentsApp } from "./application/server";
import { container } from "./dependencies";

const app = new WebRtcExperimentsApp({
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  port: process.env.PORT!,
  container,
});

app.run();
