export interface IStatsRepository {
  countUsers(): Promise<number>;
  countComplaints(): Promise<number>;
  getRecentComplaints(limit: number): Promise<any[]>;
  getComplaintsLocations(contractorId?: string): Promise<any[]>;
  getSparkPredictions(): Promise<any[]>;
  createAuditLog(data: any): Promise<any>;
  findAllAuditLogs(
    page: number,
    limit: number,
    type?: string,
    requestingUserId?: string,
    requestingUserRole?: string,
  ): Promise<[any[], number]>;
}
