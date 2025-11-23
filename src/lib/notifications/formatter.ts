/**
 * Message formatters for different notification providers
 */

import type { NotificationPayload, NotificationProvider } from "./types";

/**
 * Format message for plain text providers
 */
export function formatPlainText(payload: NotificationPayload): string {
  const {
    serviceName,
    status,
    message,
    timestamp,
    responseTime,
    statusCode,
    incidentId,
    isRecovery,
  } = payload;

  const emoji = isRecovery || status === "up" ? "✅" : "🚨";
  const statusText = isRecovery ? "RECOVERED" : status.toUpperCase();

  let text = `${emoji} Service Alert: ${serviceName}\n\n`;
  text += `Status: ${statusText}\n`;
  text += `Time: ${new Date(timestamp).toLocaleString()}\n`;

  if (responseTime) {
    text += `Response Time: ${responseTime}ms\n`;
  }

  if (statusCode) {
    text += `Status Code: ${statusCode}\n`;
  }

  text += `\nMessage: ${message}`;

  if (incidentId) {
    text += `\n\nIncident ID: #${incidentId}`;
  }

  return text;
}

/**
 * Format message for Discord (supports Markdown)
 */
export function formatDiscord(payload: NotificationPayload): {
  content?: string;
  embeds: Array<{
    title: string;
    description: string;
    color: number;
    fields: Array<{ name: string; value: string; inline: boolean }>;
    timestamp: string;
    footer?: { text: string };
  }>;
} {
  const {
    serviceName,
    status,
    message,
    timestamp,
    responseTime,
    statusCode,
    incidentId,
    isRecovery,
  } = payload;

  const emoji = isRecovery || status === "up" ? "✅" : "🚨";
  const statusText = isRecovery ? "RECOVERED" : status.toUpperCase();

  // Color coding: green for up/recovery, red for down, orange for error/timeout
  let color = 0x2e_cc_71; // Green
  if (!isRecovery && status !== "up") {
    color = status === "down" ? 0xe7_4c_3c : 0xe6_7e_22; // Red or Orange
  }

  const fields = [
    {
      name: "Status",
      value: `${emoji} **${statusText}**`,
      inline: true,
    },
  ];

  if (responseTime) {
    fields.push({
      name: "Response Time",
      value: `${responseTime}ms`,
      inline: true,
    });
  }

  if (statusCode) {
    fields.push({
      name: "Status Code",
      value: String(statusCode),
      inline: true,
    });
  }

  return {
    embeds: [
      {
        title: `Service Alert: ${serviceName}`,
        description: message,
        color,
        fields,
        timestamp,
        footer: incidentId ? { text: `Incident #${incidentId}` } : undefined,
      },
    ],
  };
}

/**
 * Format message for Slack (supports Block Kit)
 */
export function formatSlack(payload: NotificationPayload): {
  blocks: Record<string, unknown>[];
  text: string; // Fallback text
} {
  const {
    serviceName,
    status,
    message,
    timestamp,
    responseTime,
    statusCode,
    incidentId,
    isRecovery,
  } = payload;

  const emoji =
    isRecovery || status === "up" ? ":white_check_mark:" : ":rotating_light:";
  const statusText = isRecovery ? "RECOVERED" : status.toUpperCase();

  const blocks: Record<string, unknown>[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `${emoji} Service Alert: ${serviceName}`,
        emoji: true,
      },
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Status:*\n${statusText}`,
        },
        {
          type: "mrkdwn",
          text: `*Time:*\n${new Date(timestamp).toLocaleString()}`,
        },
      ],
    },
  ];

  if (responseTime || statusCode) {
    const fields: Array<{ type: string; text: string }> = [];

    if (responseTime) {
      fields.push({
        type: "mrkdwn",
        text: `*Response Time:*\n${responseTime}ms`,
      });
    }

    if (statusCode) {
      fields.push({
        type: "mrkdwn",
        text: `*Status Code:*\n${statusCode}`,
      });
    }

    blocks.push({
      type: "section",
      fields,
    });
  }

  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*Message:*\n${message}`,
    },
  });

  if (incidentId) {
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `Incident #${incidentId}`,
        },
      ],
    });
  }

  return {
    blocks,
    text: formatPlainText(payload), // Fallback
  };
}

/**
 * Format message for HTML email
 */
export function formatEmailHtml(payload: NotificationPayload): string {
  const {
    serviceName,
    status,
    message,
    timestamp,
    responseTime,
    statusCode,
    incidentId,
    isRecovery,
  } = payload;

  const statusText = isRecovery ? "RECOVERED" : status.toUpperCase();

  let statusColor = "#e67e22"; // Orange
  if (isRecovery || status === "up") {
    statusColor = "#2ecc71"; // Green
  } else if (status === "down") {
    statusColor = "#e74c3c"; // Red
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: ${statusColor}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
    .field { margin: 10px 0; }
    .label { font-weight: bold; color: #555; }
    .value { color: #333; }
    .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">Service Alert: ${serviceName}</h2>
      <p style="margin: 5px 0 0 0; font-size: 18px;">${statusText}</p>
    </div>
    <div class="content">
      <div class="field">
        <span class="label">Time:</span>
        <span class="value">${new Date(timestamp).toLocaleString()}</span>
      </div>
      ${
        responseTime
          ? `
      <div class="field">
        <span class="label">Response Time:</span>
        <span class="value">${responseTime}ms</span>
      </div>
      `
          : ""
      }
      ${
        statusCode
          ? `
      <div class="field">
        <span class="label">Status Code:</span>
        <span class="value">${statusCode}</span>
      </div>
      `
          : ""
      }
      <div class="field">
        <span class="label">Message:</span>
        <p class="value">${message}</p>
      </div>
      ${
        incidentId
          ? `
      <div class="field">
        <span class="label">Incident ID:</span>
        <span class="value">#${incidentId}</span>
      </div>
      `
          : ""
      }
    </div>
    <div class="footer">
      <p>Relay Pulse Monitoring System</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Get email subject line
 */
export function formatEmailSubject(payload: NotificationPayload): string {
  const { serviceName, isRecovery, status } = payload;

  if (isRecovery) {
    return `✅ ${serviceName} - Service Recovered`;
  }

  const emoji = status === "up" ? "✅" : "🚨";
  return `${emoji} ${serviceName} - ${status.toUpperCase()}`;
}

/**
 * Get the appropriate formatter for a provider
 */
type FormatterResultMap = {
  telegram: {
    parse_mode: "HTML";
    text: string;
  };
  discord: ReturnType<typeof formatDiscord>;
  slack: ReturnType<typeof formatSlack>;
  email: {
    subject: string;
    html: string;
    text: string;
  };
};

type FormatMessageReturn<P extends NotificationProvider> =
  P extends keyof FormatterResultMap ? FormatterResultMap[P] : string;

export function formatMessage<P extends NotificationProvider>(
  provider: P,
  payload: NotificationPayload
): FormatMessageReturn<P> {
  switch (provider) {
    case "telegram": {
      const telegramPayload: FormatterResultMap["telegram"] = {
        parse_mode: "HTML",
        text: formatPlainText(payload)
          .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
          .replace(/\*(.*?)\*/g, "<i>$1</i>"),
      };
      return telegramPayload as FormatMessageReturn<P>;
    }

    case "discord":
      return formatDiscord(payload) as FormatMessageReturn<P>;

    case "slack":
      return formatSlack(payload) as FormatMessageReturn<P>;

    case "email": {
      const emailPayload: FormatterResultMap["email"] = {
        subject: formatEmailSubject(payload),
        html: formatEmailHtml(payload),
        text: formatPlainText(payload),
      };
      return emailPayload as FormatMessageReturn<P>;
    }

    default:
      return formatPlainText(payload) as FormatMessageReturn<P>;
  }
}
