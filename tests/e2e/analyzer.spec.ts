import { expect, test } from "@playwright/test";

test("diagnoses pasted transaction-result XDR and exports the report", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Paste XDR" }).click();
  await page.getByLabel("BASE64 TRANSACTIONRESULT XDR").fill("AAAAAAAAAGT////5AAAAAA==");
  await page.getByRole("button", { name: /Analyze transaction/ }).click();

  await expect(page.getByRole("heading", { name: "Insufficient account balance" })).toBeVisible();
  await expect(page.getByText("TRANSACTION FAILED")).toBeVisible();

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export report" }).click();
  await expect((await download).suggestedFilename()).toBe("stellar-diagnosis-xdr.json");
});

test("switching input modes does not submit an analysis", async ({ page }) => {
  const analysisRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().endsWith("/api/analyze")) analysisRequests.push(request.method());
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Paste XDR" }).click();
  await page.getByRole("button", { name: "Hash lookup" }).click();
  await expect(page.getByLabel("TRANSACTION HASH")).toBeVisible();
  expect(analysisRequests).toEqual([]);
});
