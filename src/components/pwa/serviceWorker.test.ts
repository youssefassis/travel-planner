import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

/**
 * The service worker is a plain script in `public/`, so it can't be imported.
 * It's evaluated here against a stubbed worker environment instead — a broken
 * worker keeps serving itself long after a bad deploy, which makes its routing
 * decisions worth pinning down.
 */

const SOURCE = readFileSync(
  join(process.cwd(), "public", "sw.js"),
  "utf8",
);

const ORIGIN = "https://wanderly.app";

type Handlers = Record<string, (event: WorkerEvent) => void>;

type WorkerEvent = {
  request?: FakeRequest;
  respondWith: (value: unknown) => void;
  waitUntil: (value: unknown) => void;
};

type FakeRequest = { url: string; method: string; mode: string };

function request(
  path: string,
  { method = "GET", mode = "no-cors", origin = ORIGIN } = {},
): FakeRequest {
  return { url: `${origin}${path}`, method, mode };
}

/** A response the worker will consider worth caching. */
function okResponse(tag: string) {
  return { status: 200, type: "basic", tag, clone: () => ({ tag }) };
}

function loadWorker({
  cached = {},
  fetchImpl,
  keys = ["wanderly-v1"],
}: {
  cached?: Record<string, unknown>;
  fetchImpl?: (req: FakeRequest) => Promise<unknown>;
  keys?: string[];
} = {}) {
  const handlers: Handlers = {};
  const store = new Map(Object.entries(cached));
  const put = vi.fn();
  const deleted: string[] = [];
  const added: string[] = [];

  const cache = {
    put,
    add: vi.fn(async (url: string) => {
      added.push(url);
    }),
  };

  const caches = {
    open: vi.fn(async () => cache),
    match: vi.fn(async (req: FakeRequest | string) => {
      const key = typeof req === "string" ? req : new URL(req.url).pathname;
      return store.get(key);
    }),
    keys: vi.fn(async () => keys),
    delete: vi.fn(async (key: string) => {
      deleted.push(key);
      return true;
    }),
  };

  const fetchMock = vi.fn(
    fetchImpl ?? (async (req: FakeRequest) => okResponse(`network:${req.url}`)),
  );

  const self = {
    addEventListener: (name: string, handler: (event: WorkerEvent) => void) => {
      handlers[name] = handler;
    },
    skipWaiting: vi.fn(),
    clients: { claim: vi.fn() },
    location: { origin: ORIGIN },
    caches,
    fetch: fetchMock,
  };

  const run = new Function(
    "self",
    "caches",
    "fetch",
    "Response",
    "URL",
    "Promise",
    SOURCE,
  );
  run(self, caches, fetchMock, { error: () => ({ status: 0 }) }, URL, Promise);

  return { handlers, self, caches, cache, fetchMock, deleted, added, put };
}

/** Runs the fetch handler and returns what it responded with, or undefined. */
async function respond(
  worker: ReturnType<typeof loadWorker>,
  req: FakeRequest,
): Promise<unknown> {
  let responded: unknown;
  let answered = false;
  worker.handlers.fetch({
    request: req,
    respondWith: (value) => {
      answered = true;
      responded = value;
    },
    waitUntil: () => {},
  });
  return answered ? await responded : undefined;
}

describe("install", () => {
  it("precaches the shell and takes over immediately", async () => {
    const worker = loadWorker();
    let work: unknown;
    worker.handlers.install({
      respondWith: () => {},
      waitUntil: (value) => {
        work = value;
      },
    });
    await work;

    expect(worker.added).toContain("/");
    expect(worker.added).toContain("/planner");
    expect(worker.self.skipWaiting).toHaveBeenCalled();
  });
});

describe("activate", () => {
  it("retires caches from older versions and keeps the current one", async () => {
    const worker = loadWorker({ keys: ["wanderly-v0", "wanderly-v1", "other"] });
    let work: unknown;
    worker.handlers.activate({
      respondWith: () => {},
      waitUntil: (value) => {
        work = value;
      },
    });
    await work;

    expect(worker.deleted).toEqual(["wanderly-v0", "other"]);
    expect(worker.self.clients.claim).toHaveBeenCalled();
  });
});

describe("what the worker refuses to handle", () => {
  it("leaves non-GET requests alone", async () => {
    const worker = loadWorker();
    expect(
      await respond(worker, request("/planner", { method: "POST" })),
    ).toBeUndefined();
  });

  it("leaves other origins alone, so map tiles never fill the cache", async () => {
    const worker = loadWorker();
    const tile = request("/tiles/1/2/3.png", { origin: "https://tiles.example" });
    expect(await respond(worker, tile)).toBeUndefined();
  });

  it("leaves RSC payloads to the router", async () => {
    const worker = loadWorker();
    expect(await respond(worker, request("/planner?_rsc=abc"))).toBeUndefined();
  });
});

describe("navigation", () => {
  const navigate = (path: string) => request(path, { mode: "navigate" });

  it("prefers the network and caches what it gets", async () => {
    const worker = loadWorker();
    const result = await respond(worker, navigate("/planner"));

    expect(result).toMatchObject({ tag: "network:https://wanderly.app/planner" });
    expect(worker.put).toHaveBeenCalled();
  });

  it("falls back to the cached page when the network is gone", async () => {
    const worker = loadWorker({
      cached: { "/planner": okResponse("cached-planner") },
      fetchImpl: async () => {
        throw new Error("offline");
      },
    });

    expect(await respond(worker, navigate("/planner"))).toMatchObject({
      tag: "cached-planner",
    });
  });

  it("falls back to the planner for a page it has never seen", async () => {
    const worker = loadWorker({
      cached: { "/planner": okResponse("cached-planner") },
      fetchImpl: async () => {
        throw new Error("offline");
      },
    });

    expect(await respond(worker, navigate("/explore"))).toMatchObject({
      tag: "cached-planner",
    });
  });
});

describe("static assets", () => {
  it("serves build output from cache without touching the network", async () => {
    const worker = loadWorker({
      cached: { "/_next/static/chunk.js": okResponse("cached-chunk") },
    });

    const result = await respond(worker, request("/_next/static/chunk.js"));
    expect(result).toMatchObject({ tag: "cached-chunk" });
    expect(worker.fetchMock).not.toHaveBeenCalled();
  });

  it("fetches and stores an asset it hasn't seen", async () => {
    const worker = loadWorker();
    await respond(worker, request("/icons/icon-192.png"));
    expect(worker.fetchMock).toHaveBeenCalled();
    expect(worker.put).toHaveBeenCalled();
  });
});

describe("what it will not store", () => {
  it("ignores a response that isn't a clean 200", async () => {
    const worker = loadWorker({
      fetchImpl: async () => ({ status: 404, type: "basic", clone: () => ({}) }),
    });

    await respond(worker, request("/icons/missing.png"));
    expect(worker.put).not.toHaveBeenCalled();
  });

  it("ignores an opaque response", async () => {
    const worker = loadWorker({
      fetchImpl: async () => ({ status: 200, type: "opaque", clone: () => ({}) }),
    });

    await respond(worker, request("/icons/opaque.png"));
    expect(worker.put).not.toHaveBeenCalled();
  });
});
