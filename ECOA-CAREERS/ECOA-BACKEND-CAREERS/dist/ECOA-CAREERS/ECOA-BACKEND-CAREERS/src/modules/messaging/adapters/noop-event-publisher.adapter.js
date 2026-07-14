"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoopEventPublisherAdapter = void 0;
const common_1 = require("@nestjs/common");
let NoopEventPublisherAdapter = class NoopEventPublisherAdapter {
    logger = new common_1.Logger('NoopEventPublisher');
    warned = false;
    async publish(_topic, _event) {
        if (!this.warned) {
            this.logger.log('Kafka disabled for this environment. Events are ignored.');
            this.warned = true;
        }
    }
    async disconnect() {
        return undefined;
    }
    async onApplicationShutdown() {
        await this.disconnect();
    }
};
exports.NoopEventPublisherAdapter = NoopEventPublisherAdapter;
exports.NoopEventPublisherAdapter = NoopEventPublisherAdapter = __decorate([
    (0, common_1.Injectable)()
], NoopEventPublisherAdapter);
//# sourceMappingURL=noop-event-publisher.adapter.js.map