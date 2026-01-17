import mongoose, { Schema, Document } from "mongoose";

// ==================== AUTH MODELS ====================

export interface ISession extends Document {
    sid: string;
    sess: any;
    expire: Date;
}

const sessionSchema = new Schema<ISession>({
    sid: { type: String, required: true, unique: true },
    sess: { type: Schema.Types.Mixed, required: true },
    expire: { type: Date, required: true, index: true },
});

export const Session = mongoose.model<ISession>("Session", sessionSchema);

export interface IUser {
    _id: string;
    id?: string;
    email?: string;
    phone?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
    activeSessionToken?: string;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>({
    _id: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, sparse: true },
    password: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    profileImageUrl: { type: String },
    activeSessionToken: { type: String },
}, { timestamps: true });

export const User = mongoose.model<IUser>("User", userSchema);

export interface IOtp extends Document {
    userId: string;
    code: string;
    type: "email" | "phone";
    expiresAt: Date;
    isUsed: boolean;
    createdAt: Date;
}

const otpSchema = new Schema<IOtp>({
    userId: { type: String, required: true },
    code: { type: String, required: true },
    type: { type: String, required: true, enum: ["email", "phone"] },
    expiresAt: { type: Date, required: true },
    isUsed: { type: Boolean, default: false },
}, { timestamps: true });

export const Otp = mongoose.model<IOtp>("Otp", otpSchema);

// ==================== BUSINESS MODELS ====================

export interface IInvestorProfile {
    _id: string;
    id?: string;
    userId?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    investorType: string;
    panNumber?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    kycStatus: string;
    riskProfile?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const investorProfileSchema = new Schema<IInvestorProfile>({
    _id: { type: String, required: true },
    userId: { type: String, unique: true, sparse: true },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    investorType: { type: String, required: true, default: "individual" },
    panNumber: { type: String },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    kycStatus: { type: String, required: true, default: "pending" },
    riskProfile: { type: String, default: "moderate" },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const InvestorProfile = mongoose.model<IInvestorProfile>("InvestorProfile", investorProfileSchema);

export interface IAdminUser {
    _id: string;
    id?: string;
    userId: string;
    role: string;
    permissions: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const adminUserSchema = new Schema<IAdminUser>({
    _id: { type: String, required: true },
    userId: { type: String, required: true, unique: true },
    role: { type: String, required: true, default: "admin" },
    permissions: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const AdminUser = mongoose.model<IAdminUser>("AdminUser", adminUserSchema);

export interface IPortfolio {
    _id: string;
    id?: string;
    investorId: string;
    fundName: string;
    totalInvested: string;
    currentValue: string;
    returns?: string;
    irr?: string;
    privateCreditAllocation?: string;
    aifExposure?: string;
    cashEquivalents?: string;
    deploymentStatus: string;
    inceptionDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

const portfolioSchema = new Schema<IPortfolio>({
    _id: { type: String, required: true },
    investorId: { type: String, required: true },
    fundName: { type: String, required: true, default: "Velocity Fund" },
    totalInvested: { type: String, required: true, default: "0" },
    currentValue: { type: String, required: true, default: "0" },
    returns: { type: String, default: "0" },
    irr: { type: String, default: "0" },
    privateCreditAllocation: { type: String, default: "0" },
    aifExposure: { type: String, default: "0" },
    cashEquivalents: { type: String, default: "0" },
    deploymentStatus: { type: String, required: true, default: "pending" },
    inceptionDate: { type: Date, default: Date.now },
}, { timestamps: true });

export const Portfolio = mongoose.model<IPortfolio>("Portfolio", portfolioSchema);

export interface ITransaction {
    _id: string;
    id?: string;
    investorId: string;
    portfolioId: string;
    type: string;
    amount: string;
    status: string;
    paymentMethod?: string;
    referenceNumber?: string;
    confirmationUrl?: string;
    notes?: string;
    processedAt?: Date;
    createdAt: Date;
}

const transactionSchema = new Schema<ITransaction>({
    _id: { type: String, required: true },
    investorId: { type: String, required: true },
    portfolioId: { type: String, required: true },
    type: { type: String, required: true },
    amount: { type: String, required: true },
    status: { type: String, required: true, default: "pending" },
    paymentMethod: { type: String },
    referenceNumber: { type: String },
    confirmationUrl: { type: String },
    notes: { type: String },
    processedAt: { type: Date },
}, { timestamps: true });

export const Transaction = mongoose.model<ITransaction>("Transaction", transactionSchema);

export interface IStatement {
    _id: string;
    id?: string;
    investorId: string;
    type: string;
    period: string;
    year: number;
    month?: number;
    quarter?: number;
    fileName: string;
    fileUrl: string;
    fileContent?: Buffer;
    fileSize?: number;
    version: number;
    generatedAt: Date;
    createdAt: Date;
}

const statementSchema = new Schema<IStatement>({
    _id: { type: String, required: true },
    investorId: { type: String, required: true },
    type: { type: String, required: true },
    period: { type: String, required: true },
    year: { type: Number, required: true },
    month: { type: Number },
    quarter: { type: Number },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileContent: { type: Buffer }, // Store PDF binary directly
    fileSize: { type: Number },
    version: { type: Number, required: true, default: 1 },
    generatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export const Statement = mongoose.model<IStatement>("Statement", statementSchema);

export interface IAnnouncement {
    _id: string;
    id?: string;
    title: string;
    content: string;
    type: string;
    priority: string;
    targetAudience: string;
    isActive: boolean;
    publishedAt?: Date;
    expiresAt?: Date;
    createdBy?: string;
    createdAt: Date;
    updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>({
    _id: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, required: true, default: "general" },
    priority: { type: String, required: true, default: "normal" },
    targetAudience: { type: String, required: true, default: "all" },
    isActive: { type: Boolean, default: true },
    publishedAt: { type: Date },
    expiresAt: { type: Date },
    createdBy: { type: String },
}, { timestamps: true });

export const Announcement = mongoose.model<IAnnouncement>("Announcement", announcementSchema);

export interface ISupportRequest {
    _id: string;
    id?: string;
    investorId: string;
    type: string;
    subject: string;
    description: string;
    status: string;
    priority: string;
    assignedTo?: string;
    resolvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const supportRequestSchema = new Schema<ISupportRequest>({
    _id: { type: String, required: true },
    investorId: { type: String, required: true },
    type: { type: String, required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, required: true, default: "open" },
    priority: { type: String, required: true, default: "normal" },
    assignedTo: { type: String },
    resolvedAt: { type: Date },
}, { timestamps: true });

export const SupportRequest = mongoose.model<ISupportRequest>("SupportRequest", supportRequestSchema);

export interface ILeadCapture {
    _id: string;
    id?: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    investmentRange?: string;
    message?: string;
    source?: string;
    status: string;
    createdAt: Date;
}

const leadCaptureSchema = new Schema<ILeadCapture>({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    company: { type: String },
    investmentRange: { type: String },
    message: { type: String },
    source: { type: String, default: "website" },
    status: { type: String, required: true, default: "new" },
}, { timestamps: true });

export const LeadCapture = mongoose.model<ILeadCapture>("LeadCapture", leadCaptureSchema);

export interface IPerformanceHistory {
    _id: string;
    id?: string;
    portfolioId: string;
    date: Date;
    value: string;
    monthlyReturn?: string;
    quarterlyReturn?: string;
    yearlyReturn?: string;
    createdAt: Date;
}

const performanceHistorySchema = new Schema<IPerformanceHistory>({
    _id: { type: String, required: true },
    portfolioId: { type: String, required: true },
    date: { type: Date, required: true },
    value: { type: String, required: true },
    monthlyReturn: { type: String },
    quarterlyReturn: { type: String },
    yearlyReturn: { type: String },
}, { timestamps: true });

export const PerformanceHistory = mongoose.model<IPerformanceHistory>("PerformanceHistory", performanceHistorySchema);

export interface INavHistory {
    _id: string;
    id?: string;
    date: Date;
    nav: string;
    aum: string;
    createdAt: Date;
}

const navHistorySchema = new Schema<INavHistory>({
    _id: { type: String, required: true },
    date: { type: Date, required: true },
    nav: { type: String, required: true },
    aum: { type: String, required: true },
}, { timestamps: true });

export const NavHistory = mongoose.model<INavHistory>("NavHistory", navHistorySchema);

export interface IReturnsHistory {
    _id: string;
    id?: string;
    period: string;
    year: number;
    month?: number;
    quarter?: number;
    grossReturn: string;
    netReturn: string;
    benchmark?: string;
    createdAt: Date;
    updatedAt: Date;
}

const returnsHistorySchema = new Schema<IReturnsHistory>({
    _id: { type: String, required: true },
    period: { type: String, required: true },
    year: { type: Number, required: true },
    month: { type: Number },
    quarter: { type: Number },
    grossReturn: { type: String, required: true },
    netReturn: { type: String, required: true },
    benchmark: { type: String },
}, { timestamps: true });

export const ReturnsHistory = mongoose.model<IReturnsHistory>("ReturnsHistory", returnsHistorySchema);

export interface INotification {
    _id: string;
    id?: string;
    investorId: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    link?: string;
    createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
    _id: { type: String, required: true },
    investorId: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, required: true, default: "info" },
    isRead: { type: Boolean, default: false },
    link: { type: String },
}, { timestamps: true });

export const Notification = mongoose.model<INotification>("Notification", notificationSchema);

export interface IAllocation {
    _id: string;
    id?: string;
    portfolioId: string;
    assetClass: string;
    assetName?: string;
    percentage: string;
    amount: string;
    status: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

const allocationSchema = new Schema<IAllocation>({
    _id: { type: String, required: true },
    portfolioId: { type: String, required: true },
    assetClass: { type: String, required: true },
    assetName: { type: String },
    percentage: { type: String, required: true },
    amount: { type: String, required: true },
    status: { type: String, required: true, default: "deployed" },
    description: { type: String },
}, { timestamps: true });

export const Allocation = mongoose.model<IAllocation>("Allocation", allocationSchema);

export interface IActivityLog {
    _id: string;
    id?: string;
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>({
    _id: { type: String, required: true },
    userId: { type: String, required: true },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: { type: String },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
}, { timestamps: true });

export const ActivityLog = mongoose.model<IActivityLog>("ActivityLog", activityLogSchema);

export interface ISystemSetting {
    _id: string;
    id?: string;
    key: string;
    value: string;
    category: string;
    description?: string;
    updatedBy?: string;
    updatedAt: Date;
}

const systemSettingSchema = new Schema<ISystemSetting>({
    _id: { type: String, required: true },
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
    category: { type: String, required: true, default: "general" },
    description: { type: String },
    updatedBy: { type: String },
}, { timestamps: true });

export const SystemSetting = mongoose.model<ISystemSetting>("SystemSetting", systemSettingSchema);

// Type exports for compatibility
export type UpsertUser = Partial<IUser> & { id?: string };
