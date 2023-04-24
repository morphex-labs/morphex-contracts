const fs = require("fs");
const csv = require("csv-parser");

const results = [];
let totalUnderperformance = 0;
let totalUnderperformanceWithFees = 0;
let count = 0;

fs.createReadStream("prices.csv")
  .pipe(csv())
  .on("data", (data) => results.push(data))
  .on("end", () => {
    for (let i = 0; i < results.length; i++) {
      const syntheticPrice = results[i].syntheticPrice;
      const glpPrice = results[i].glpPrice;
      const glpPlusFees = results[i].glpPlusFees;

      if (syntheticPrice && glpPrice && glpPlusFees) {
        const underperformance =
          ((syntheticPrice - glpPrice) / syntheticPrice) * 100;
        const underperformanceWithFees =
          ((syntheticPrice - glpPlusFees) / syntheticPrice) * 100;
        console.log(
          `Underperformance on ${results[i].Date}: ${underperformance.toFixed(
            2
          )}%`
        );
        console.log(
          `Underperformance with fees on ${
            results[i].Date
          }: ${underperformanceWithFees.toFixed(2)}%`
        );
        totalUnderperformance += underperformance;
        totalUnderperformanceWithFees += underperformanceWithFees;
        count++;
      }
    }
    const averageUnderperformance = totalUnderperformance / count;
    const averageUnderperformanceWithFees =
      totalUnderperformanceWithFees / count;
    console.log(
      `Average underperformance: ${averageUnderperformance.toFixed(2)}%`
    );
    console.log(
      `Average underperformance with fees: ${averageUnderperformanceWithFees.toFixed(
        2
      )}%`
    );
  });
