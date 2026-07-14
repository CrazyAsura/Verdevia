"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplaintPrivacy = exports.PollutionType = exports.ComplaintStatus = void 0;
var ComplaintStatus;
(function (ComplaintStatus) {
    ComplaintStatus["PENDENTE"] = "pendente";
    ComplaintStatus["EM_ANALISE"] = "em_analise";
    ComplaintStatus["RESOLVIDO"] = "resolvido";
    ComplaintStatus["REJEITADO"] = "rejeitado";
})(ComplaintStatus || (exports.ComplaintStatus = ComplaintStatus = {}));
var PollutionType;
(function (PollutionType) {
    PollutionType["AGUA"] = "Oceano / Rios";
    PollutionType["FLORESTA"] = "Florestas / Parques";
    PollutionType["URBANO"] = "\u00C1reas Urbanas";
    PollutionType["INDUSTRIAL"] = "Zonas Industriais";
    PollutionType["OUTRO"] = "Outro";
})(PollutionType || (exports.PollutionType = PollutionType = {}));
var ComplaintPrivacy;
(function (ComplaintPrivacy) {
    ComplaintPrivacy["PUBLICO"] = "publico";
    ComplaintPrivacy["PRIVADO"] = "privado";
    ComplaintPrivacy["MISTO"] = "misto";
})(ComplaintPrivacy || (exports.ComplaintPrivacy = ComplaintPrivacy = {}));
//# sourceMappingURL=complaint.enums.js.map