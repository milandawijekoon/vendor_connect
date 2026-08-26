"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InquiryStatus = exports.VendorStatus = exports.Role = void 0;
var Role;
(function (Role) {
    Role["COUPLE"] = "COUPLE";
    Role["VENDOR"] = "VENDOR";
    Role["ADMIN"] = "ADMIN";
})(Role || (exports.Role = Role = {}));
var VendorStatus;
(function (VendorStatus) {
    VendorStatus["PENDING"] = "PENDING";
    VendorStatus["APPROVED"] = "APPROVED";
    VendorStatus["REJECTED"] = "REJECTED";
    VendorStatus["SUSPENDED"] = "SUSPENDED";
})(VendorStatus || (exports.VendorStatus = VendorStatus = {}));
var InquiryStatus;
(function (InquiryStatus) {
    InquiryStatus["NEW"] = "NEW";
    InquiryStatus["CONTACTED"] = "CONTACTED";
    InquiryStatus["CONFIRMED"] = "CONFIRMED";
    InquiryStatus["CLOSED"] = "CLOSED";
})(InquiryStatus || (exports.InquiryStatus = InquiryStatus = {}));
//# sourceMappingURL=enums.js.map