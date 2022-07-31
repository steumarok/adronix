import { AbstractService } from "@adronix/server";
import jwt from "jsonwebtoken";

export class JwtService extends AbstractService {

    sign(payload: any) {
        return jwt.sign(payload, "test")
    }

}

