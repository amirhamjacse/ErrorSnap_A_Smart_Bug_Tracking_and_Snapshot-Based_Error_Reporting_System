import { toPng } from "html-to-image";

interface config {
  projectId: string;
}

interface errorData {
  type: string;
  projectId?: string;
  message: string | Event;
  source?: string;
  lineno?: number | undefined;
  colno?: number | undefined;
  stack: string | null | undefined;
  timestamp?: string;
}

export default class ErrorSnap {
  projectId: string;

  constructor(config: config) {
    this.projectId = config.projectId;
  }

  initialize() {
    console.log("Initilized ErrorSnap with project id:", this.projectId);
    this.initErrorHandling();
  }

  initErrorHandling() {
    window.onerror = (message, source, lineno, colno, error) => {
      this.logError({
        type: "error",
        message,
        source,
        lineno,
        colno,
        stack: error ? error.stack : null,
      });
    };

    window.onunhandledrejection = (event) => {
      this.logError({
        type: "unhandledrejection",
        message: event.reason ? event.reason.message : "Unhandled Rejection",
        stack: event.reason ? event.reason.stack : null,
      });
    };
  }

  logError(errorData: errorData) {
    const browser = this.getBrowserInfo();
    const os = this.getOSInfo();
    const errorPayload = {
      ...errorData,
      browser,
      os,
      projectId: this.projectId,
      timestamp: new Date().toISOString(),
    };

    const targetElement = document.body;
    let imageData = null;
    toPng(targetElement)
      .then((url) => {
        imageData = url;
      })
      .catch((err) => {
        console.error("Error taking screenshot:", err);
      })
      .finally(() => {
        fetch(process.env.ERROR_LOGS_API_URL, {
          method: "POST",
          body: JSON.stringify({ ...errorPayload, image: imageData }),
          headers: {
            "Content-Type": "application/json",
          },
        }).catch((err) => console.error("Failed to log error:", err));
      });
  }

  getBrowserInfo() {
    if ((navigator as any)?.userAgentData) {
      const mainBrand = (navigator as any)?.userAgentData?.brands.find(
        (brand) =>
          brand.brand.includes("Chrome") ||
          brand.brand.includes("Firefox") ||
          brand.brand.includes("Safari") ||
          brand.brand.includes("Edge")
      );

      return mainBrand
        ? `${mainBrand.brand} ${mainBrand.version}`
        : "Unknown Browser";
    } else {
      return this.parseUserAgentForBrowser();
    }
  }

  getOSInfo() {
    if ((navigator as any)?.userAgentData) {
      return (navigator as any)?.userAgentData.platform;
    } else {
      return this.parseUserAgentForOS();
    }
  }

  parseUserAgentForBrowser() {
    const userAgent = navigator.userAgent;
    let browserName = "Unknown Browser";
    let fullVersion = "";

    if (
      userAgent.includes("Chrome") &&
      !userAgent.includes("Edge") &&
      !userAgent.includes("OPR")
    ) {
      browserName = "Chrome";
      fullVersion = userAgent.match(/Chrome\/([\d.]+)/)?.[1] || "";
    } else if (userAgent.includes("Firefox")) {
      browserName = "Firefox";
      fullVersion = userAgent.match(/Firefox\/([\d.]+)/)?.[1] || "";
    } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
      browserName = "Safari";
      fullVersion = userAgent.match(/Version\/([\d.]+)/)?.[1] || "";
    } else if (userAgent.includes("Edge")) {
      browserName = "Edge";
      fullVersion = userAgent.match(/Edg\/([\d.]+)/)?.[1] || "";
    } else if (userAgent.includes("OPR") || userAgent.includes("Opera")) {
      browserName = "Opera";
      fullVersion =
        userAgent.match(/OPR\/([\d.]+)/)?.[1] ||
        userAgent.match(/Opera\/([\d.]+)/)?.[1] ||
        "";
    }

    return `${browserName} ${fullVersion}`;
  }

  parseUserAgentForOS() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Windows")) return "Windows";
    if (userAgent.includes("Mac OS")) return "Mac OS";
    if (userAgent.includes("Linux")) return "Linux";
    if (userAgent.includes("Android")) return "Android";
    if (userAgent.includes("iPhone") || userAgent.includes("iPad"))
      return "iOS";
    return "Unknown OS";
  }
}
