"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaLog = exports.KAFKA_LOG_METADATA = void 0;
const common_1 = require("@nestjs/common");
exports.KAFKA_LOG_METADATA = 'kafka_log_metadata';
const KafkaLog = (options) => {
    const actionName = typeof options === 'string' ? options : options?.action;
    return (0, common_1.SetMetadata)(exports.KAFKA_LOG_METADATA, { actionName });
};
exports.KafkaLog = KafkaLog;
//# sourceMappingURL=kafka-log.decorator.js.map