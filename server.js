import express from "express";
import puppeteer from "puppeteer";

const app = express();

app.use(express.json({ limit: "20mb" }));

/* =========================
   HTML → PDF API
========================= */

app.post("/pdf", async (req, res) => {
  try {

    const { html, fileName } = req.body;

    if (!html) {
      return res.status(400).send("Missing HTML");
    }

const browser = await puppeteer.launch({
  headless: "new",
  executablePath: process.env.CHROME_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox", "--disable-setuid-sandbox"]
});

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle0"
    });

    const pdf = await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${fileName || "report.pdf"}`
    });

    res.send(pdf);

  } catch (err) {

    console.error(err);
    res.status(500).send("PDF generation failed");

  }
});

/* =========================
   health check
========================= */

app.get("/", (req, res) => {
  res.send("PDF Server Running");
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Server running on port", port);
});
