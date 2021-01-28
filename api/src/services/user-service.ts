
export class UserService {

    constructor() {

    }

    isConnected(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            resolve(false)
        })
    }
}
