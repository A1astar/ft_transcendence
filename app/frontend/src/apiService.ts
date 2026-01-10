import { SERVER_BASE } from "./view/utils.js";

export class apiService {
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }
  private baseURL: string;

  private generateHeaders(headers: { [key: string]: string } = {}): {
    [key: string]: string;
  } {
    // Attach JWT token from localStorage if present
    try {
      // const jwtToken = localStorage.getItem('jwt');
      const token = localStorage.getItem("token");
      console.log("headers:\n", headers);
      if (token) {
        headers = {
          ...headers,
          Authorization: `Bearer ${token}`,
        };
      }
    } catch {
      // localStorage might be unavailable in some environments
    }
    return headers;
  }

  public async post(endpoint: string, body: any): Promise<Response> {
    return await fetch(this.baseURL + endpoint, {
      method: "POST",
      headers: this.generateHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(body),
    });
  }

  public async get(endpoint: string): Promise<Response> {
    return await fetch(this.baseURL + endpoint, {
      method: "GET",
      headers: this.generateHeaders(),
    });
  }

  public async update(endpoint: string, body: any): Promise<Response> {
    return await fetch(this.baseURL + endpoint, {
      method: "PUT",
      headers: this.generateHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(body),
    });
  }

  public async delete(endpoint: string): Promise<Response> {
    return await fetch(this.baseURL + endpoint, {
      method: "DELETE",
      headers: this.generateHeaders(),
    });
  }
}

export const API_URL = `https://${SERVER_BASE}:8443`;
export const ApiClient = new apiService(API_URL);
