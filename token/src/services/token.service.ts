class TokenService {

  async encode(phoneNumber: string) {
    return {encode: phoneNumber}
  }

  async decode() {
    return {decode: true}
  }

}
const tokenService = new TokenService();
export { tokenService };
