import axios from "axios";
import cron from "node-cron";

const PREDICTION_WEBHOOK_URL =
    "https://n8n.srv1038201.hstgr.cloud/webhook/agent/prediction";

export const startMetricsJob = () => {
    cron.schedule("* * * * *", async () => {
        // try {
        //     const response = await axios.get(PREDICTION_WEBHOOK_URL);

        //     console.log("[metrics.job] Prediction API response:", response.data);
        // } catch (error) {
        //     console.error("[metrics.job] Error calling prediction API:", error);
        // }
    });

    // console.log("[metrics.job] Scheduled to run every minute.");
};
