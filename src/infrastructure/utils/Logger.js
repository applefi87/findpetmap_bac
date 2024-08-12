import { createLogger, format, transports } from 'winston';

/**
 * 提供應用程式日誌服務的類。
 */
class Logger {
    /**
     * 初始化 Logger 實例。
     */
    constructor() {
        this.logger = createLogger({
            level: 'info', // 預設日誌等級。
            format: format.combine(
                format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss'
                }),
                format.errors({ stack: true }), // 捕獲堆疊追蹤。
                format.splat(),
                format.json()
            ),
            transports: [
                new transports.Console({
                    format: format.combine(
                        format.colorize(), // 為了更好的可讀性對日誌輸出進行著色。
                        format.simple() // 控制台輸出的簡單格式。
                    )
                })
            ]
        });
    }

    /**
     * 記錄訊息的通用方法。
     * @param {string} level - 日誌等級。
     * @param {string} message - 日誌訊息。
     * @param {object} [meta={}] - 附加的元數據。
     */
    log(level, message, meta = {}) {
        this.logger.log(level, message, meta);
    }

    /**
     * 快捷方式以 'info' 等級記錄訊息。
     * @param {string} message - 日誌訊息。
     * @param {object} [meta={}] - 附加的元數據。
     */
    info(message, meta = {}) {
        this.logger.info(message, meta);
    }

    /**
     * 快捷方式以 'error' 等級記錄訊息。
     * @param {string} message - 日誌訊息。
     * @param {object} [meta={}] - 附加的元數據。
     */
    error(message, meta = {}) {
        this.logger.error(message, meta);
    }

    // Additional shortcut methods for other logging levels can be added here...
}

export default new Logger();  // Exporting an instance for global use.
