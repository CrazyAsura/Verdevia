"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const typeorm_1 = require("typeorm");
const complaint_entity_1 = require("../../complaints/entities/complaint.entity");
const user_enums_1 = require("../enums/user.enums");
const class_transformer_1 = require("class-transformer");
const user_profile_entity_1 = require("../../profiles/entities/user-profile.entity");
const user_gamification_entity_1 = require("../../gamification/entities/user-gamification.entity");
const address_entity_1 = require("../../addresses/entities/address.entity");
const phone_entity_1 = require("../../phones/entities/phone.entity");
let User = class User {
    id;
    email;
    password;
    role;
    profile;
    gamification;
    address;
    phones;
    complaints;
    subscription;
    parentUserId;
    parentUser;
    subordinates;
    createdAt;
    updatedAt;
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'simple-enum',
        enum: user_enums_1.UserRole,
        default: user_enums_1.UserRole.USER,
    }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_profile_entity_1.UserProfile, (profile) => profile.user, { cascade: true }),
    __metadata("design:type", user_profile_entity_1.UserProfile)
], User.prototype, "profile", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_gamification_entity_1.UserGamification, (gamification) => gamification.user, {
        cascade: true,
    }),
    __metadata("design:type", user_gamification_entity_1.UserGamification)
], User.prototype, "gamification", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => address_entity_1.Address, (address) => address.user, { cascade: true }),
    __metadata("design:type", address_entity_1.Address)
], User.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => phone_entity_1.Phone, (phone) => phone.user, { cascade: true }),
    __metadata("design:type", Array)
], User.prototype, "phones", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => complaint_entity_1.Complaint, (complaint) => complaint.user),
    __metadata("design:type", Array)
], User.prototype, "complaints", void 0);
__decorate([
    (0, typeorm_1.OneToOne)('Subscription', 'user', { cascade: true }),
    __metadata("design:type", Object)
], User.prototype, "subscription", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "parentUserId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User, (user) => user.subordinates, {
        nullable: true,
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'parentUserId' }),
    __metadata("design:type", User)
], User.prototype, "parentUser", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => User, (user) => user.parentUser),
    __metadata("design:type", Array)
], User.prototype, "subordinates", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=user.entity.js.map