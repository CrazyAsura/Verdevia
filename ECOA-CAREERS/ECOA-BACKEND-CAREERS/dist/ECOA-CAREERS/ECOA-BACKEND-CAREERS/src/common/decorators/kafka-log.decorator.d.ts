export declare const KAFKA_LOG_METADATA = "kafka_log_metadata";
export interface KafkaLogOptions {
    action?: string;
}
export declare const KafkaLog: (options?: KafkaLogOptions | string) => any;
