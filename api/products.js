const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTCiZyzCSU3bjNEY-rfgu_FmZSpcdQ7KzBvzbCgkCQiapQTjkAB5NJnXs8V5OqDZJJJKfcGLmR2YxjA/pub?output=csv";

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.status(405).send("Method Not Allowed");
    return;
  }

  try {
    const sheetResponse = await fetch(SHEET_CSV_URL, {
      headers: {
        "Accept": "text/csv,text/plain,*/*"
      }
    });

    if (!sheetResponse.ok) {
      throw new Error(`Google Sheets respondio HTTP ${sheetResponse.status}`);
    }

    const csvText = await sheetResponse.text();

    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    response.setHeader("Content-Type", "text/csv; charset=utf-8");
    response.status(200).send(csvText);
  } catch (error) {
    response.setHeader("Cache-Control", "no-store");
    response.status(502).json({
      error: error instanceof Error ? error.message : "No se pudo leer la hoja"
    });
  }
};
