import { AbstractService } from "@adronix/server";

export class AuthService extends AbstractService {

    async authenticate(username: string, password: string) {
        if (username == "test") {
            return false
        }
        return true
    }

}

