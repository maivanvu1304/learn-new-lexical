import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const contractPath = path.resolve(process.cwd(), "..", "specs", "001-vocab-review-app", "contracts", "openapi.yaml");

test("OpenAPI contract includes sync and portability paths", () => {
  const content = fs.readFileSync(contractPath, "utf8");

  assert.match(content, /\/sync:/, "missing /sync path");
  assert.match(content, /\/import:/, "missing /import path");
  assert.match(content, /\/export:/, "missing /export path");
  assert.match(content, /SyncRequest:/, "missing SyncRequest schema");
  assert.match(content, /SyncResponse:/, "missing SyncResponse schema");
  assert.match(content, /ImportReport:/, "missing ImportReport schema");
  assert.match(content, /ExportPackage:/, "missing ExportPackage schema");
});
