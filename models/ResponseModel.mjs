export default class ResponseModel {
  constructor({ statusCode = 200, message = '', data = null } = {}) {
    this.success = false;
    this.statusCode = statusCode;
    if (statusCode >= 200 && statusCode <= 299) this.success = true;
    if (message !== '') this.message = message;
    if (data) this.data = data;
  }
  static get(message, data) {
    return new ResponseModel({ statusCode: 200, message: message, data: data });
  }
  static post(message, data) {
    return new ResponseModel({ statusCode: 201, message: message, data: data });
  }
}
