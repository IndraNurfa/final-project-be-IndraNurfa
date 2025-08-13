export interface IAppService {
  getHealthCheck(): Promise<string>;
}
