export class httpError extends Error {
    public readonly httpCode: number;

    constructor(message: string, httpCode: number) {
        super(message);
        this.httpCode = httpCode;
    }
}
