"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XssSanitizerInterceptor = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
let XssSanitizerInterceptor = class XssSanitizerInterceptor {
    DANGEROUS_PATTERNS = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe/gi,
        /<object/gi,
        /<embed/gi,
        /vbscript:/gi,
        /data:text\/html/gi,
    ];
    intercept(context, next) {
        let body;
        try {
            const gqlCtx = graphql_1.GqlExecutionContext.create(context);
            const gqlArgs = gqlCtx.getArgs();
            if (gqlArgs && Object.keys(gqlArgs).length > 0) {
                this.sanitizeObject(gqlArgs);
            }
            else {
                const req = context.switchToHttp().getRequest();
                if (req?.body) {
                    this.sanitizeObject(req.body);
                }
            }
        }
        catch {
        }
        return next.handle();
    }
    sanitizeObject(obj) {
        if (!obj || typeof obj !== 'object')
            return;
        for (const key of Object.keys(obj)) {
            const value = obj[key];
            if (typeof value === 'string') {
                obj[key] = this.sanitizeString(value);
            }
            else if (typeof value === 'object' && value !== null) {
                this.sanitizeObject(value);
            }
        }
    }
    sanitizeString(input) {
        let result = input;
        for (const pattern of this.DANGEROUS_PATTERNS) {
            result = result.replace(pattern, '');
        }
        return result.trim();
    }
};
exports.XssSanitizerInterceptor = XssSanitizerInterceptor;
exports.XssSanitizerInterceptor = XssSanitizerInterceptor = __decorate([
    (0, common_1.Injectable)()
], XssSanitizerInterceptor);
//# sourceMappingURL=xss-sanitizer.interceptor.js.map