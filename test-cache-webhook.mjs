/**
 * Test script — Validates Cache (Redis) and Webhook
 * Run: node --experimental-vm-modules test-cache-webhook.mjs
 * Or just use PowerShell Invoke-WebRequest
 */

const REDIS_URL = "https://loved-eft-131475.upstash.io";
const REDIS_TOKEN = "gQAAAAAAAgGTAAIgcDI2ZjQ3ZjE2OTQ3OGQ0NjY3YTUzOWM2MTU5YjI3NTZjYQ";
const APP_URL = "http://localhost:3000";

// ─── Helpers ────────────────────────────────────────────────────────────────

async function redisCmd(...args) {
  const res = await fetch(REDIS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  const json = await res.json();
  return json.result;
}

function pass(msg) { console.log(`  ✅ PASS: ${msg}`); }
function fail(msg) { console.error(`  ❌ FAIL: ${msg}`); process.exitCode = 1; }

// ─── Test 1: Redis connectivity ──────────────────────────────────────────────
async function testRedis() {
  console.log("\n[TEST 1] Redis Connectivity & Read/Write");
  try {
    const testKey = "test:cache:check";
    const testVal = `ok_${Date.now()}`;

    await redisCmd("SET", testKey, testVal, "EX", "30");
    const result = await redisCmd("GET", testKey);

    if (result === testVal) {
      pass(`Redis SET/GET works. Value: ${result}`);
    } else {
      fail(`Redis GET returned: ${result} (expected: ${testVal})`);
    }
  } catch (e) {
    fail(`Redis error: ${e.message}`);
  }
}

// ─── Test 2: Pixel Config save to Redis ──────────────────────────────────────
async function testPixelConfig() {
  console.log("\n[TEST 2] Pixel Config Redis Storage");
  try {
    const pixelKey = "store:pixel_config";
    const testConfig = {
      pixelId: "TEST_PIXEL_123456",
      conversionEvent: "Purchase",
      testMode: false,
      enabled: true,
      updatedAt: new Date().toISOString(),
    };

    await redisCmd("SET", pixelKey, JSON.stringify(testConfig));
    const raw = await redisCmd("GET", pixelKey);
    const parsed = JSON.parse(raw);

    if (parsed.pixelId === testConfig.pixelId && parsed.enabled === true) {
      pass(`Pixel config saved & retrieved. pixelId=${parsed.pixelId}`);
    } else {
      fail(`Pixel config mismatch. Got: ${JSON.stringify(parsed)}`);
    }

    // Clean up test entry
    await redisCmd("DEL", pixelKey);
    pass("Pixel config test entry cleaned up");
  } catch (e) {
    fail(`Pixel config Redis test error: ${e.message}`);
  }
}

// ─── Test 3: Webhook endpoint (GET health check) ─────────────────────────────
async function testWebhookHealth() {
  console.log("\n[TEST 3] Webhook Endpoint Health Check (GET /api/revalidate)");
  try {
    const res = await fetch(`${APP_URL}/api/revalidate`);
    const json = await res.json();

    if (json.status === "ok") {
      pass(`Webhook endpoint reachable. redisConfigured=${json.redisConfigured}, sanitySecretConfigured=${json.sanitySecretConfigured}`);
    } else {
      fail(`Unexpected response: ${JSON.stringify(json)}`);
    }
  } catch (e) {
    fail(`Could not reach ${APP_URL}/api/revalidate — Is the dev server running? Error: ${e.message}`);
  }
}

// ─── Test 4: Webhook POST (unauthorized — should 401) ─────────────────────────
async function testWebhookUnauthorized() {
  console.log("\n[TEST 4] Webhook Security — Must Reject Invalid Secret");
  try {
    const res = await fetch(`${APP_URL}/api/revalidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-webhook-secret": "WRONG_SECRET" },
      body: JSON.stringify({ _type: "product", slug: { current: "test-product" } }),
    });

    if (res.status === 401) {
      pass("Webhook correctly rejected invalid secret with 401");
    } else {
      fail(`Expected 401 but got ${res.status}`);
    }
  } catch (e) {
    fail(`Webhook unauthorized test error: ${e.message}`);
  }
}

// ─── Test 5: Webhook POST (authorized — should 200 and clear cache) ──────────
async function testWebhookAuthorized() {
  console.log("\n[TEST 5] Webhook POST with Valid Secret — Cache Invalidation");

  // Read the secret from .env.local first
  const { readFileSync } = await import("fs");
  let secret = "";
  try {
    const envContent = readFileSync(".env.local", "utf-8");
    const match = envContent.match(/SANITY_WEBHOOK_SECRET=(.+)/);
    secret = match ? match[1].trim().replace(/^["']|["']$/g, "") : "";
  } catch {
    fail("Could not read .env.local to get SANITY_WEBHOOK_SECRET");
    return;
  }

  if (!secret) {
    fail("SANITY_WEBHOOK_SECRET is not set in .env.local");
    return;
  }

  // First write a fake product cache key
  const fakeKey = "v3:product:test-slug-webhook";
  await redisCmd("SET", fakeKey, JSON.stringify({ fake: true }), "EX", "60");
  const beforeVal = await redisCmd("GET", fakeKey);
  if (!beforeVal) {
    fail("Pre-condition: could not set test cache key");
    return;
  }
  pass(`Pre-condition: test cache key set. Value present: ${!!beforeVal}`);

  try {
    const res = await fetch(`${APP_URL}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": secret,
      },
      body: JSON.stringify({
        _type: "product",
        slug: { current: "test-slug-webhook" },
      }),
    });

    const json = await res.json();

    if (res.status === 200 && json.success === true) {
      pass(`Webhook accepted. Response: ${JSON.stringify(json.revalidated)}`);
    } else {
      fail(`Webhook returned ${res.status}: ${JSON.stringify(json)}`);
      return;
    }

    // Check that Redis key was deleted
    await new Promise(r => setTimeout(r, 500)); // give webhook time
    const afterVal = await redisCmd("GET", fakeKey);
    if (!afterVal) {
      pass("Redis cache key was cleared by webhook ✓");
    } else {
      fail(`Redis cache key still present after webhook: ${afterVal}`);
    }
  } catch (e) {
    fail(`Webhook authorized test error: ${e.message}`);
  }
}

// ─── Run All Tests ───────────────────────────────────────────────────────────
console.log("═══════════════════════════════════════════════════");
console.log("   MAISON D'OR — Cache & Webhook Test Suite");
console.log("═══════════════════════════════════════════════════");

await testRedis();
await testPixelConfig();
await testWebhookHealth();
await testWebhookUnauthorized();
await testWebhookAuthorized();

console.log("\n═══════════════════════════════════════════════════");
if (process.exitCode === 1) {
  console.error("RESULT: ❌ Some tests FAILED — see above.");
} else {
  console.log("RESULT: ✅ All tests PASSED");
}
console.log("═══════════════════════════════════════════════════\n");
