import {
    CloudWatchLogsClient,
    PutLogEventsCommand,
    DescribeLogStreamsCommand,
    CreateLogGroupCommand,
    CreateLogStreamCommand
} from "@aws-sdk/client-cloudwatch-logs";

class CloudWatchLogger {
    static client = new CloudWatchLogsClient({
        region: "ap-northeast-1",
        credentials: {
            accessKeyId: process.env.AWS_CLOUDWATCH_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_CLOUDWATCH_SECRET_ACCESS_KEY
        }
    });
    static logGroupName = "backend-error-log";
    static logStreamName = "log_stream_1";
    static sequenceToken = null;
    static logBuffer = [];
    static maxBatchSize = 10000; // Adjust based on your needs
    static maxBatchTime = 5000; // 5 seconds

    static async initialize() {
        await this.ensureLogGroupExists();
        await this.ensureLogStreamExists();
    }

    static async logMessage(code, level, trace, data = undefined, logData = undefined) {
        try {

            if (process.env.NODE_ENV === "production") {
                await this.initialize();
                const logEntry = {
                    message: JSON.stringify({
                        code,
                        level,
                        trace,
                        data,
                        logData
                    }),
                    timestamp: Date.now()
                };
                this.logBuffer.push(logEntry);
                if (this.logBuffer.length >= this.maxBatchSize) {
                    await this.flushLogs();
                } else {
                    setTimeout(() => this.flushLogs(), this.maxBatchTime);
                }
            } else {
                console.log("Just dev mode, Cloudwatch would record:");
                const logEntry = {
                    message: JSON.stringify({
                        code,
                        level,
                        trace,
                        data,
                        logData //Only databaseError will have
                    }),
                    timestamp: Date.now()
                };
                console.log(logEntry);
                console.log("---log end---");
                this.logBuffer = [];

            }
        } catch (error) {
            console.error("Error adding message to aws log buffer:", error);
            console.log(error);
        }
    }

    static async flushLogs() {
        if (this.logBuffer.length === 0) return;

        try {
            if (!this.sequenceToken) {
                await this.getSequenceToken();
            }

            const input = {
                logGroupName: this.logGroupName,
                logStreamName: this.logStreamName,
                logEvents: this.logBuffer,
                sequenceToken: this.sequenceToken
            };

            const command = new PutLogEventsCommand(input);
            const response = await this.client.send(command);
            this.sequenceToken = response.nextSequenceToken;

            this.logBuffer = [];
            console.log("Successfully logged batch to CloudWatch");
        } catch (error) {
            if (error.name === 'InvalidSequenceTokenException') {
                await this.getSequenceToken();
                await this.flushLogs();
            } else {
                console.error("Error flushing logs to CloudWatch:", error);
            }
        }
    }

    static async getSequenceToken() {
        try {
            const response = await this.client.send(new DescribeLogStreamsCommand({
                logGroupName: this.logGroupName,
                logStreamNamePrefix: this.logStreamName
            }));
            if (response.logStreams.length > 0) {
                this.sequenceToken = response.logStreams[0].uploadSequenceToken;
            }
        } catch (error) {
            console.error("Error getting sequence token from CloudWatch:", error);
        }
    }

    static async ensureLogGroupExists() {
        try {
            await this.client.send(new CreateLogGroupCommand({ logGroupName: this.logGroupName }));
            console.log(`Log group ${this.logGroupName} created.`);
        } catch (error) {
            if (error.name !== 'ResourceAlreadyExistsException') {
                console.error("Error creating log group:", error);
            }
        }
    }

    static async ensureLogStreamExists() {
        try {
            await this.client.send(new CreateLogStreamCommand({
                logGroupName: this.logGroupName,
                logStreamName: this.logStreamName
            }));
            console.log(`Log stream ${this.logStreamName} created.`);
        } catch (error) {
            if (error.name !== 'ResourceAlreadyExistsException') {
                console.error("Error creating log stream:", error);
            }
        }
    }
}

export default CloudWatchLogger;
