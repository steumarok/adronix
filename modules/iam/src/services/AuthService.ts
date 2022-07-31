import { AbstractService, InjectService } from "@adronix/server";
import { JwtService } from "./JwtService";

export class AuthService extends AbstractService {

    async authenticate(username: string, password: string) {
        if (username == "test") {
            return false
        }
        return true
    }

}

