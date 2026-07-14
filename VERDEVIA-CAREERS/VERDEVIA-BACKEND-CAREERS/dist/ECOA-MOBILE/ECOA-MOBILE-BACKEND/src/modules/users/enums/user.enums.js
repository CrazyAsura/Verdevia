"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = exports.UserEthnicity = exports.UserGender = void 0;
var UserGender;
(function (UserGender) {
    UserGender["MASCULINO"] = "Masculino";
    UserGender["FEMININO"] = "Feminino";
    UserGender["OUTRO"] = "Outro";
    UserGender["NAO_INFORMAR"] = "Prefiro n\u00E3o dizer";
})(UserGender || (exports.UserGender = UserGender = {}));
var UserEthnicity;
(function (UserEthnicity) {
    UserEthnicity["BRANCA"] = "Branca";
    UserEthnicity["PRETA"] = "Preta";
    UserEthnicity["PARDA"] = "Parda";
    UserEthnicity["AMARELA"] = "Amarela";
    UserEthnicity["INDIGENA"] = "Ind\u00EDgena";
})(UserEthnicity || (exports.UserEthnicity = UserEthnicity = {}));
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["ADMIN"] = "admin";
    UserRole["USER"] = "user";
    UserRole["MODERATOR"] = "moderator";
    UserRole["CONTRACTOR"] = "contractor";
    UserRole["SUPER_CONTRACTOR"] = "super_contractor";
})(UserRole || (exports.UserRole = UserRole = {}));
//# sourceMappingURL=user.enums.js.map