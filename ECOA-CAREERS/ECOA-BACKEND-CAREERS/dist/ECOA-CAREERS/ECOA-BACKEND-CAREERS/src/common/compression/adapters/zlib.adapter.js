"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZlibCompressionAdapter = void 0;
const common_1 = require("@nestjs/common");
const zlib_1 = require("zlib");
const util_1 = require("util");
const deflateAsync = (0, util_1.promisify)(zlib_1.deflateRaw);
const inflateAsync = (0, util_1.promisify)(zlib_1.inflateRaw);
let ZlibCompressionAdapter = class ZlibCompressionAdapter {
    async compress(data) {
        return deflateAsync(Buffer.from(data, 'utf8'));
    }
    async decompress(compressed) {
        const decompressed = await inflateAsync(compressed);
        return decompressed.toString('utf8');
    }
};
exports.ZlibCompressionAdapter = ZlibCompressionAdapter;
exports.ZlibCompressionAdapter = ZlibCompressionAdapter = __decorate([
    (0, common_1.Injectable)()
], ZlibCompressionAdapter);
//# sourceMappingURL=zlib.adapter.js.map