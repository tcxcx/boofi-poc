import { useState, useEffect } from "react";

type BrowserInfo = {
  isOpera: boolean;
  isOperaMini: boolean;
  isMinipay: boolean;
  browserName: string;
};

const useDetectBrowser = (): BrowserInfo => {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo>({
    isOpera: false,
    isOperaMini: false,
    isMinipay: false,
    browserName: "",
  });

  useEffect(() => {
    const detectBrowser = () => {
      const userAgent = navigator.userAgent.toLowerCase();

      let isOpera = false;
      let isOperaMini = false;
      let isMinipay = false;
      let browserName = "";

      // Opera
      if (userAgent.includes("opera") || userAgent.includes("opr")) {
        isOpera = true;
        browserName = "Opera";
      }

      // Opera Mini (including beta versions)
      if (userAgent.includes("opera mini") || userAgent.includes("opr/mini")) {
        isOperaMini = true;
        browserName = "Opera Mini";
      }

      // Minipay
      if (userAgent.includes("minipay")) {
        isMinipay = true;
        browserName = "MiniPay";
      }

      // Other browsers (for completeness)
      if (!isOpera && !isOperaMini && !isMinipay) {
        if (
          userAgent.includes("chrome") &&
          !userAgent.includes("opr") &&
          !userAgent.includes("edge")
        ) {
          browserName = "Chrome";
        } else if (
          userAgent.includes("safari") &&
          !userAgent.includes("chrome")
        ) {
          browserName = "Safari";
        } else if (userAgent.includes("firefox")) {
          browserName = "Firefox";
        } else if (
          userAgent.includes("msie") ||
          userAgent.includes("trident")
        ) {
          browserName = "Internet Explorer";
        } else {
          browserName = "Unknown";
        }
      }

      console.log("Detected browser info:", {
        isOpera,
        isOperaMini,
        isMinipay,
        browserName,
      });
      setBrowserInfo({ isOpera, isOperaMini, isMinipay, browserName });
    };

    detectBrowser();
  }, []);

  return browserInfo;
};

export default useDetectBrowser;
