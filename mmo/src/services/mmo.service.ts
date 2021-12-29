import { UserFacingError } from '../classes/errors';
class MmoService {
  async getAccountName() {
    return { ok: true };
  }
}
const mmoService = new MmoService();
export { mmoService };
