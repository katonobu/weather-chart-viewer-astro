/*import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
*/
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");
const https = require("https");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// 3つの時間帯
const TIME_SLOTS = ["1540", "1000", "0340"];

// 今日から3日遡った分の yyyymmdd を生成
function generateDates() {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < 3; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    dates.push(`${y}${m}${day}`);
  }
  return dates;
}

// secure_url から JSON を取得する関数
async function fetchJsonFromUrl(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(err);
          }
        });
      })
      .on("error", reject);
  });
}

async function main() {
  const dates = generateDates();
  const result = {};

  for (const date of dates) {
    for (const hhmm of TIME_SLOTS) {
      const key = `${date}_${hhmm}`;
      const folder = `weather-chart/${key}`;
      const jsonPath = `${folder}/metadata_detail.json`;

      try {
        // metadata_detail.json のメタ情報を取得
        const metadata = await cloudinary.api.resource(jsonPath, {
          resource_type: "raw",
        });

        // secure_url から JSON 本体を取得
        const json = await fetchJsonFromUrl(metadata.secure_url);

        result[key] = {
          date,
          hhmm,
          folder,
          metadata: json,
        };

        console.log(`OK: ${jsonPath}`);
      } catch (err) {
        console.log(`SKIP: ${jsonPath} (${err.message})`);
      }
    }
  }

  // all_detail.json を保存
  const outPath = path.join("src/data/all_detail.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2));

  console.log("Generated:", outPath);
}

main();