import { FormDefinitions } from "@adronix/server";
import { AuthService } from "../services/AuthService";
import { JwtService } from "../services/JwtService";

const definitions: FormDefinitions = {
    '/auth/login': {
        handler: async function ({ username, password }) {

            const authService = this.service(AuthService)
            const success = await authService.authenticate(username, password)

            if (success) {
                const token = this.service(JwtService).sign({ username })
                this.response.status(200).json({
                    token
                })
            }
            else {
                return {
                    'auth': 'Auth failed'
                }
            }
        },
        rules: {
            'username': [
                [ ({ username }) => !!username, 'username not valid']
            ]
        }
    }
}

export default definitions