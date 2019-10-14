import axios, { AxiosPromise } from "axios";

export class HttpRequest {
  static API_URL: string;
  static HEADERS: { [key: string]: string };

  static init(url: string, headers: { [key: string]: string }) {
    HttpRequest.API_URL = url;
    HttpRequest.HEADERS = headers;
  }

  static get<T>(path: string, params?: any): AxiosPromise<T> {
    return axios
      .get<T>(`${HttpRequest.API_URL}/${path}`, {
        headers: HttpRequest.HEADERS,
        params: params
      })
      .then(res => {
        return Promise.resolve(res);
      })
      .catch(HttpRequest.handleHttpError);
  }

  static delete(path: string, params?: any) {
    return axios
      .delete(`${HttpRequest.API_URL}/${path}`, {
        headers: HttpRequest.HEADERS,
        params: {
          ...params
        }
      })
      .catch(HttpRequest.handleHttpError);
  }

  static post<T>(path: string, data?: any, params?: any): AxiosPromise<T> {
    return axios
      .post<T>(`${HttpRequest.API_URL}/${path}`, data, {
        headers: HttpRequest.HEADERS,
        params: {
          ...params
        }
      })
      .catch(HttpRequest.handleHttpError);
  }

  static put<T>(path: string, data: any, params?: any): AxiosPromise<T> {
    return axios
      .put<T>(`${HttpRequest.API_URL}/${path}`, data, {
        headers: HttpRequest.HEADERS,
        params: {
          ...params
        }
      })
      .catch(HttpRequest.handleHttpError);
  }

  static patch<T>(path: string, params?: any): AxiosPromise<T> {
    return axios
      .patch<T>(`${HttpRequest.API_URL}/${path}`, {
        headers: HttpRequest.HEADERS,
        params: {
          ...params
        }
      })
      .catch(HttpRequest.handleHttpError);
  }

  static handleHttpError(error: any) {
    // error("failed - ", error.message);
    // Error 😨
    if (error.response) {
      /*
       * The request was made and the server responded with a
       * status code that falls out of the range of 2xx
       */
      error(error.response.data);
      error(error.response.status);
      error(error.response.headers);
    } else if (error.request) {
      /*
       * The request was made but no response was received, `error.request`
       * is an instance of XMLHttpRequest in the browser and an instance
       * of http.ClientRequest in Node.js
       */
      error(error.request);
    } else {
      // Something happened in setting up the request and triggered an Error
      error("Error", error.message);
    }
    error(error.config);
    return Promise.reject(error);
  }
}
